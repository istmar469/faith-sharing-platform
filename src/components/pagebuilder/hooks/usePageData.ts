
import { useState, useEffect } from 'react';
import { useTenantContext } from '@/components/context/TenantContext';
import { PageData, getPage, getHomepage } from '@/services/pageService';

export function usePageData(pageId?: string) {
  const { organizationId: contextOrgId } = useTenantContext();
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get organization ID from URL params if context doesn't have it
  const searchParams = new URLSearchParams(window.location.search);
  const urlOrgId = searchParams.get('organization_id');
  const organizationId = contextOrgId || urlOrgId;

  useEffect(() => {
    // Don't attempt to load if no organization ID is available
    if (!organizationId) {
      console.log('usePageData: No organization ID available, skipping data load');
      setLoading(false);
      return;
    }

    const loadPage = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('usePageData: Loading page', { pageId, organizationId });

        let data: PageData | null = null;

        if (pageId) {
          // Load specific page
          data = await getPage(pageId);
          
          // Verify page belongs to the correct organization
          if (data && data.organization_id !== organizationId) {
            console.error('usePageData: Page organization mismatch', {
              pageOrgId: data.organization_id,
              expectedOrgId: organizationId
            });
            setError('Page not found or access denied');
            setLoading(false);
            return;
          }
        } else {
          // Load homepage or create default
          data = await getHomepage(organizationId);
          
          if (!data) {
            // Create default homepage data with proper PuckData format
            data = {
              title: 'Welcome to Our Website',
              slug: 'home',
              content: {
                content: [
                  {
                    type: 'header',
                    props: {
                      text: 'Welcome to Our Website',
                      level: 1
                    }
                  },
                  {
                    type: 'paragraph', 
                    props: {
                      text: 'Start editing this page to create your content!'
                    }
                  }
                ],
                root: {}
              },
              organization_id: organizationId,
              published: false,
              show_in_navigation: true,
              is_homepage: !pageId // Only set as homepage if no pageId
            };
          }
        }

        console.log('usePageData: Page loaded successfully', data);
        setPageData(data);
      } catch (err: any) {
        console.error('usePageData: Error loading page:', err);
        setError('Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [pageId, organizationId]);

  return { pageData, setPageData, loading, error };
}
