
import React, { useState, useEffect } from 'react';
import { Puck } from '@measured/puck';
import { puckConfig } from './puck/config/PuckConfig';
import { useNavigate, useParams } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TranslucentAdminBar from './TranslucentAdminBar';
import '@measured/puck/puck.css';

const FullWidthPageBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { pageId } = useParams();
  const { organizationId } = useTenantContext();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageData, setPageData] = useState<any>(null);
  const [currentData, setCurrentData] = useState<any>({
    content: [],
    root: { props: {} }
  });
  const [title, setTitle] = useState('New Page');
  const [published, setPublished] = useState(false);
  const [showAdminBar, setShowAdminBar] = useState(true);

  // Load page data
  useEffect(() => {
    const loadPage = async () => {
      if (pageId && pageId !== 'new') {
        try {
          const { data, error } = await supabase
            .from('pages')
            .select('*')
            .eq('id', pageId)
            .single();

          if (error) throw error;

          setPageData(data);
          setTitle(data.title);
          setPublished(data.published);
          setCurrentData(data.content || { content: [], root: { props: {} } });
        } catch (err) {
          console.error('Error loading page:', err);
          toast.error('Failed to load page');
        }
      }
      setLoading(false);
    };

    loadPage();
  }, [pageId]);

  // Auto-save functionality
  const handleSave = async () => {
    if (!organizationId) {
      toast.error('Organization ID required');
      return;
    }

    setSaving(true);
    try {
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const pagePayload = {
        title,
        slug,
        content: currentData,
        published,
        organization_id: organizationId,
        show_in_navigation: true
      };

      let result;
      if (pageId && pageId !== 'new') {
        result = await supabase
          .from('pages')
          .update(pagePayload)
          .eq('id', pageId)
          .select()
          .single();
      } else {
        result = await supabase
          .from('pages')
          .insert(pagePayload)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setPageData(result.data);
      toast.success('Page saved successfully');

      // Navigate to edit mode if was creating new
      if (pageId === 'new') {
        navigate(`/page-builder/${result.data.id}`, { replace: true });
      }
    } catch (err) {
      console.error('Error saving page:', err);
      toast.error('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  // Handle content changes with auto-save
  const handleContentChange = (newData: any) => {
    setCurrentData(newData);
    // Auto-save after 2 seconds of inactivity
    clearTimeout(window.autoSaveTimeout);
    window.autoSaveTimeout = setTimeout(() => {
      handleSave();
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative">
      {/* Translucent Admin Bar */}
      {showAdminBar && (
        <TranslucentAdminBar
          title={title}
          published={published}
          saving={saving}
          onTitleChange={setTitle}
          onPublishToggle={() => setPublished(!published)}
          onSave={handleSave}
          onHide={() => setShowAdminBar(false)}
        />
      )}

      {/* Show Admin Bar Toggle (when hidden) */}
      {!showAdminBar && (
        <button
          onClick={() => setShowAdminBar(true)}
          className="fixed top-4 right-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Show Admin Bar"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* Full Width Puck Editor */}
      <div className={`w-full transition-all duration-300 ${showAdminBar ? 'pt-16' : 'pt-0'}`}>
        <Puck
          config={puckConfig}
          data={currentData}
          onChange={handleContentChange}
          onPublish={handleSave}
        />
      </div>
    </div>
  );
};

export default FullWidthPageBuilder;
