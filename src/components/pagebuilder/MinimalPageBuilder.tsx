
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import MinimalEditor from './MinimalEditor';

interface Page {
  id?: string;
  title: string;
  content: any;
  organization_id: string;
}

const MinimalPageBuilder: React.FC = () => {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  // Get organization ID from URL or use default for development
  useEffect(() => {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname.includes('lovable');
    
    if (isLocalhost) {
      // For development, use a default org ID or create one
      setOrganizationId('dev-org-123');
      loadOrCreatePage('dev-org-123');
    } else {
      // For subdomain, extract organization from subdomain
      const subdomain = hostname.split('.')[0];
      findOrganizationBySubdomain(subdomain);
    }
  }, []);

  const findOrganizationBySubdomain = async (subdomain: string) => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id')
        .eq('subdomain', subdomain)
        .single();

      if (error || !data) {
        console.error('Organization not found:', error);
        setLoading(false);
        return;
      }

      setOrganizationId(data.id);
      loadOrCreatePage(data.id);
    } catch (error) {
      console.error('Error finding organization:', error);
      setLoading(false);
    }
  };

  const loadOrCreatePage = async (orgId: string) => {
    try {
      // Try to find existing homepage
      const { data: existingPage, error } = await supabase
        .from('pages')
        .select('*')
        .eq('organization_id', orgId)
        .eq('is_homepage', true)
        .maybeSingle();

      if (existingPage) {
        setPage(existingPage);
      } else {
        // Create new homepage
        const newPage: Page = {
          title: 'Welcome to Your Website',
          content: {
            time: Date.now(),
            blocks: [
              {
                type: 'header',
                data: {
                  text: 'Welcome to Your Website',
                  level: 1
                }
              },
              {
                type: 'paragraph',
                data: {
                  text: 'Start editing this page to create your content.'
                }
              }
            ],
            version: '2.30.8'
          },
          organization_id: orgId
        };
        setPage(newPage);
      }
    } catch (error) {
      console.error('Error loading page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (content: any) => {
    if (!page || !organizationId) return;

    setSaving(true);
    try {
      const pageData = {
        title: page.title,
        slug: 'homepage',
        content,
        published: true,
        show_in_navigation: false,
        is_homepage: true,
        organization_id: organizationId
      };

      if (page.id) {
        // Update existing page
        const { error } = await supabase
          .from('pages')
          .update(pageData)
          .eq('id', page.id);

        if (error) throw error;
      } else {
        // Create new page
        const { data, error } = await supabase
          .from('pages')
          .insert(pageData)
          .select()
          .single();

        if (error) throw error;
        setPage({ ...page, id: data.id });
      }

      console.log('Page saved successfully');
    } catch (error) {
      console.error('Error saving page:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading page builder...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Failed to load page</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Page Builder</h1>
          <div className="flex items-center space-x-4">
            {saving && <span className="text-sm text-gray-500">Saving...</span>}
            <span className="text-sm text-gray-500">
              {page.id ? 'Editing page' : 'New page'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <MinimalEditor
            initialData={page.content}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
};

export default MinimalPageBuilder;
