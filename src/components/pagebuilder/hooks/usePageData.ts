
import { useState, useEffect } from 'react';
import { useTenantContext } from '@/components/context/TenantContext';
import { PageData, getPage, getHomepage } from '@/services/pageService';

export function usePageData(pageId?: string) {
  const { organizationId } = useTenantContext();
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) return;

    const loadPage = async () => {
      try {
        setLoading(true);
        setError(null);

        let data: PageData | null = null;

        if (pageId) {
          // Load specific page
          data = await getPage(pageId);
        } else {
          // Load homepage or create default
          data = await getHomepage(organizationId);
          
          if (!data) {
            // Create default homepage data
            data = {
              title: 'Welcome to Our Website',
              slug: 'home',
              content: {
                time: Date.now(),
                blocks: [
                  {
                    type: 'header',
                    data: {
                      text: 'Welcome to Our Website',
                      level: 1
                    }
                  },
                  {
                    type: 'paragraph',
                    data: {
                      text: 'Start editing this page to create your content!'
                    }
                  }
                ],
                version: '2.30.8'
              },
              organization_id: organizationId,
              published: false,
              show_in_navigation: true,
              is_homepage: !pageId // Only set as homepage if no pageId
            };
          }
        }

        setPageData(data);
      } catch (err: any) {
        console.error('Error loading page:', err);
        setError('Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [pageId, organizationId]);

  return { pageData, setPageData, loading, error };
}
