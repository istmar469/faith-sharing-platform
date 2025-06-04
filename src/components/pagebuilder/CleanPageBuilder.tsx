import React, { useState, useEffect } from 'react';
import { Puck } from '@measured/puck';
import { puckConfig } from './puck/config/PuckConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Globe, GlobeLock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useParams } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import '@measured/puck/puck.css';

const CleanPageBuilder: React.FC = () => {
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

  // Save page
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

  // Toggle publish
  const handleTogglePublish = async () => {
    const newPublishedState = !published;
    setPublished(newPublishedState);
    
    // Auto-save when publishing/unpublishing
    await handleSave();
  };

  // Back to dashboard
  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Page title"
            className="w-64"
          />
          
          {published ? (
            <Badge className="bg-green-100 text-green-800 border-green-300">
              <Globe className="h-3 w-3 mr-1" />
              Published
            </Badge>
          ) : (
            <Badge variant="outline" className="border-gray-300">
              <GlobeLock className="h-3 w-3 mr-1" />
              Draft
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
          
          <Button onClick={handleTogglePublish} disabled={saving}>
            {published ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Puck Editor */}
      <div className="flex-1 bg-gray-50">
        <div className="h-full max-w-7xl mx-auto bg-white shadow-sm">
          <style>
            {`
              /* Minimal Puck layout adjustments */
              .puck-container .Puck {
                height: 100% !important;
                border-radius: 0 !important;
              }
              
              .puck-container .Puck-canvas {
                background: #f9fafb !important;
                padding: 24px !important;
              }
              
              .puck-container .Puck-canvas > div {
                max-width: 1000px !important;
                margin: 0 auto !important;
                background: white !important;
                border-radius: 8px !important;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06) !important;
                min-height: 600px !important;
                overflow: hidden !important;
              }
              
              /* Clean sidebar styling */
              .puck-container .Puck-sidebarLeft {
                border-right: 1px solid #e5e7eb !important;
                background: #ffffff !important;
              }
              
              .puck-container .Puck-sidebarRight {
                border-left: 1px solid #e5e7eb !important;
                background: #ffffff !important;
              }
              
              /* Header styling */
              .puck-container .Puck-header {
                border-bottom: 1px solid #e5e7eb !important;
                background: #ffffff !important;
              }
              
              /* Responsive adjustments */
              @media (max-width: 1024px) {
                .puck-container .Puck-canvas {
                  padding: 16px !important;
                }
                
                .puck-container .Puck-canvas > div {
                  margin: 0 8px !important;
                }
              }
            `}
          </style>
          <div className="puck-container h-full">
            <Puck
              config={puckConfig}
              data={currentData}
              onChange={setCurrentData}
              onPublish={handleSave}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanPageBuilder; 