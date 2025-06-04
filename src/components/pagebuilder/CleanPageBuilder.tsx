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
      <div className="flex-1">
        <style>
          {`
            /* Force Puck to use full available space */
            .Puck {
              height: 100% !important;
              display: flex !important;
              flex-direction: row !important;
            }
            
            /* Left sidebar styling */
            .Puck-sidebarLeft {
              width: 280px !important;
              min-width: 280px !important;
              flex-shrink: 0 !important;
            }
            
            /* Main content area - take remaining space */
            .Puck-portal {
              flex: 1 !important;
              display: flex !important;
              flex-direction: column !important;
              min-width: 0 !important;
            }
            
            /* Canvas container - center it if not full width */
            .Puck-canvas {
              flex: 1 !important;
              max-width: none !important;
              width: 100% !important;
              margin: 0 auto !important;
              padding: 20px !important;
              background: #f8fafc !important;
            }
            
            /* Canvas content area */
            .Puck-canvas > div {
              max-width: 1200px !important;
              width: 100% !important;
              margin: 0 auto !important;
              background: white !important;
              border-radius: 8px !important;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
              min-height: 600px !important;
            }
            
            /* Preview frame styling */
            .Puck-preview {
              max-width: none !important;
              width: 100% !important;
              margin: 0 auto !important;
            }
            
            /* Make sure the iframe takes full width */
            .Puck-preview iframe {
              width: 100% !important;
            }
            
            /* Right sidebar - hide if present or style it */
            .Puck-sidebarRight {
              width: 300px !important;
              min-width: 300px !important;
              flex-shrink: 0 !important;
            }
            
            /* If no right sidebar, just use the space */
            .Puck:not(.Puck--rightSidebarVisible) .Puck-portal {
              max-width: none !important;
            }
            
            /* Header area inside Puck */
            .Puck-header {
              background: white !important;
              border-bottom: 1px solid #e2e8f0 !important;
              padding: 12px 20px !important;
            }
            
            /* Responsive adjustments */
            @media (max-width: 1024px) {
              .Puck-canvas > div {
                max-width: none !important;
                margin: 0 10px !important;
              }
              
              .Puck-canvas {
                padding: 10px !important;
              }
            }
          `}
        </style>
        <Puck
          config={puckConfig}
          data={currentData}
          onChange={setCurrentData}
          onPublish={handleSave}
        />
      </div>
    </div>
  );
};

export default CleanPageBuilder; 