import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import SubdomainLayout from '@/components/subdomain/SubdomainLayout';
import PuckRenderer from '@/components/pagebuilder/puck/PuckRenderer';
import NotFoundPage from './NotFoundPage';

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
  const { organizationId, isSubdomainAccess, isContextReady } = useTenantContext();
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Render the page with SubdomainLayout
  return (
    <div className="min-h-screen">
      <SubdomainLayout organizationId={organizationId!}>
        <PuckRenderer 
          data={pageData.content || { content: [], root: {} }}
          className="min-h-screen"
        />
      </SubdomainLayout>
    </div>
  );
};

export default DynamicPageRenderer; 