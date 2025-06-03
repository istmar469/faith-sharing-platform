
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Render } from '@measured/puck';
import { puckConfig } from '@/components/pagebuilder/puck/config/PuckConfig';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/components/context/TenantContext';
import '@measured/puck/puck.css';

const DynamicPageRenderer: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { organizationId } = useTenantContext();
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      if (!organizationId) {
        setError('Organization not found');
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('pages')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('published', true);

        // If no slug provided, get homepage
        if (!slug || slug === 'home') {
          query = query.eq('is_homepage', true);
        } else {
          query = query.eq('slug', slug);
        }

        const { data, error } = await query.single();

        if (error) {
          console.error('Error loading page:', error);
          setError('Page not found');
          return;
        }

        if (data) {
          setPageData(data);
        } else {
          setError('Page not found');
        }
      } catch (err) {
        console.error('Error loading page:', err);
        setError('Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [slug, organizationId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600">{error || 'The requested page could not be found.'}</p>
        </div>
      </div>
    );
  }

  // Ensure content has proper structure for Puck
  const renderData = pageData.content || { content: [], root: { props: {} } };

  return (
    <div className="min-h-screen w-full">
      <Render 
        config={puckConfig} 
        data={renderData} 
      />
    </div>
  );
};

export default DynamicPageRenderer;
