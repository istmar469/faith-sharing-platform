
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import { Puck } from '@measured/puck';
import { puckConfig } from './puck/config/PuckConfig';
import { createEnhancedPuckOverrides } from './puck/config/EnhancedPuckOverrides';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { safeCastToPuckData, createDefaultPuckData } from './utils/puckDataHelpers';
import '@measured/puck/puck.css';

const SimplePageEditor: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { organizationId, organizationName, subdomain, isSubdomainAccess } = useTenantContext();
  
  const [pageData, setPageData] = useState<any>(null);
  const [content, setContent] = useState<any>(createDefaultPuckData());
  const [isPublished, setIsPublished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load page data on mount
  useEffect(() => {
    if (!organizationId || !slug) return;
    
    loadPage();
  }, [organizationId, slug]);

  const loadPage = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('slug', slug)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPageData(data);
        setContent(safeCastToPuckData(data.content));
        setIsPublished(data.published);
      } else {
        // Page doesn't exist, create a new one
        setPageData(null);
        setContent(createDefaultPuckData());
        setIsPublished(false);
      }
    } catch (err: any) {
      console.error('Error loading page:', err);
      setError(err.message);
      toast.error('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!organizationId || isSaving) return;

    setIsSaving(true);
    try {
      const pageToSave = {
        title: pageData?.title || slug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'New Page',
        slug: slug,
        content: content,
        organization_id: organizationId,
        published: isPublished,
        show_in_navigation: true,
        is_homepage: slug === 'home'
      };

      let result;
      if (pageData?.id) {
        // Update existing page
        result = await supabase
          .from('pages')
          .update(pageToSave)
          .eq('id', pageData.id)
          .select()
          .single();
      } else {
        // Create new page
        result = await supabase
          .from('pages')
          .insert(pageToSave)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setPageData(result.data);
      toast.success('Page saved successfully');
    } catch (err: any) {
      console.error('Error saving page:', err);
      toast.error('Failed to save page');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    const newPublishState = !isPublished;
    setIsPublished(newPublishState);
    
    // Auto-save when publishing/unpublishing
    await handleSave();
    
    toast.success(newPublishState ? 'Page published' : 'Page unpublished');
  };

  const handleExit = () => {
    if (isSubdomainAccess) {
      navigate('/');
    } else {
      navigate(`/dashboard/${organizationId}`);
    }
  };

  const handlePreview = () => {
    if (subdomain) {
      window.open(`https://${subdomain}.church-os.com/${slug}`, '_blank');
    }
  };

  const puckOverrides = createEnhancedPuckOverrides({
    organizationName,
    organizationId,
    subdomain,
    pageSlug: slug,
    isPublished,
    isSaving,
    onSave: handleSave,
    onPublish: handlePublishToggle,
    onPreview: handlePreview,
    onExit: handleExit,
    onTogglePublished: handlePublishToggle
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Puck
        config={puckConfig}
        data={content}
        onChange={setContent}
        onPublish={handleSave}
        overrides={puckOverrides}
      />
    </div>
  );
};

export default SimplePageEditor;
