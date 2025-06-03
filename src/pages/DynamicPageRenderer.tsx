import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { supabase } from '@/integrations/supabase/client';
import SubdomainLayout from '@/components/subdomain/SubdomainLayout';
import PuckRenderer from '@/components/pagebuilder/puck/PuckRenderer';
import NotFoundPage from './NotFoundPage';
import { Button } from '@/components/ui/button';
import { Edit, Eye, ArrowLeft, Settings } from 'lucide-react';

interface PageData {
  id: string;
  title: string;
  slug: string;
  content: any;
  meta_title?: string;
  meta_description?: string;
  published: boolean;
}

const DynamicPageRenderer: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { organizationId, isSubdomainAccess, isContextReady } = useTenantContext();
  const { isAuthenticated } = useAuthStatus();
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if this is preview mode from URL params
  const isPreviewMode = searchParams.get('preview') === 'true';
  const hasEditMode = searchParams.get('editMode') === 'true';
  const showAdminOverlay = isAuthenticated; // Show for all authenticated users on subdomain

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug || !organizationId || !isContextReady) {
        setLoading(false);
        return;
      }

      // Only handle subdomain access - main domain should not use this component
      if (!isSubdomainAccess) {
        setError('Page routing only available for subdomain access');
        setLoading(false);
        return;
      }

      try {
        console.log('DynamicPageRenderer: Fetching page with slug:', slug, 'for org:', organizationId);
        
        const { data: page, error: fetchError } = await supabase
          .from('pages')
          .select('id, title, slug, content, meta_title, meta_description, published')
          .eq('organization_id', organizationId)
          .eq('slug', slug)
          .eq('published', true)
          .maybeSingle();

        if (fetchError) {
          console.error('DynamicPageRenderer: Error fetching page:', fetchError);
          setError('Failed to load page');
          return;
        }

        if (!page) {
          console.log('DynamicPageRenderer: No page found with slug:', slug);
          setError('Page not found');
          return;
        }

        console.log('DynamicPageRenderer: Found page:', page.title);
        setPageData(page);

        // Update page title and meta tags
        if (page.meta_title || page.title) {
          document.title = page.meta_title || page.title;
        }
        
        if (page.meta_description) {
          let metaDescription = document.querySelector('meta[name="description"]');
          if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
          }
          metaDescription.setAttribute('content', page.meta_description);
        }

      } catch (err) {
        console.error('DynamicPageRenderer: Exception fetching page:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug, organizationId, isContextReady, isSubdomainAccess]);

  const handleEditPage = () => {
    if (pageData?.id) {
      // Navigate to page builder with proper organization context
      const editUrl = `/page-builder/${pageData.id}?organization_id=${organizationId}`;
      window.location.href = editUrl;
    }
  };

  const handleBackToDashboard = () => {
    // Navigate to dashboard
    if (isSubdomainAccess) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = `/dashboard/${organizationId}`;
    }
  };

  const togglePreviewMode = () => {
    if (isPreviewMode) {
      // Exit preview mode - go to normal page view
      window.location.href = `/${slug}`;
    } else {
      // Enter preview mode
      window.location.href = `/${slug}?preview=true&editMode=true`;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  // Show error state or 404
  if (error || !pageData) {
    return <NotFoundPage />;
  }

  // Render the page with SubdomainLayout and optional admin overlay
  return (
    <div className="min-h-screen">
      {/* Admin Overlay for Authenticated Users */}
      {showAdminOverlay && (
        <div className="fixed top-0 left-0 right-0 bg-slate-900 text-white px-4 py-2 shadow-lg z-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="h-4 w-4" />
            <span className="text-sm font-medium">Admin View</span>
            <span className="text-xs bg-slate-700 px-2 py-1 rounded">
              {pageData?.title || 'Page'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm"
              variant="secondary"
              onClick={handleBackToDashboard}
              className="flex items-center gap-1 bg-slate-700 text-white hover:bg-slate-600"
            >
              <ArrowLeft className="h-3 w-3" />
              Dashboard
            </Button>
            <Button 
              size="sm"
              variant="secondary"
              onClick={handleEditPage}
              className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
            >
              <Edit className="h-3 w-3" />
              Edit Page
            </Button>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className={showAdminOverlay ? "pt-12" : ""}>
        <SubdomainLayout organizationId={organizationId!}>
          <PuckRenderer 
            data={pageData.content || { content: [], root: {} }}
            className="min-h-screen"
          />
        </SubdomainLayout>
      </div>
    </div>
  );
};

export default DynamicPageRenderer; 