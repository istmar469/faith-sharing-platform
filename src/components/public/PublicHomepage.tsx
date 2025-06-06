import React, { useState, useEffect } from 'react';
import { Render } from '@measured/puck';
import { puckConfig } from '@/components/pagebuilder/puck/config/PuckConfig';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/components/context/TenantContext';
import PublicPageLayout from './PublicPageLayout';
import '@measured/puck/puck.css';
import { Link } from 'react-router-dom';

const PublicHomepage: React.FC = () => {
  const { organizationId, organizationName } = useTenantContext();
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHomepage = async () => {
      if (!organizationId) {
        setLoading(false);
        setError('Organization context not available.');
        return;
      }

      try {
        const { data, error: queryError } = await supabase
          .from('pages')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('is_homepage', true)
          .eq('published', true)
          .single();

        if (queryError && queryError.code !== 'PGRST116') {
          // PGRST116 means no rows found
          throw new Error(queryError.message);
        }

        if (data) {
          setPageData(data);
          setError(null); // Clear previous errors
        } else {
          setError(
            `No published homepage has been set for ${organizationName}.`
          );
        }
      } catch (err: any) {
        setError(`Failed to load homepage: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadHomepage();
  }, [organizationId, organizationName]);

  if (loading) {
    return (
      <PublicPageLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </PublicPageLayout>
    );
  }

  if (error || !pageData) {
    return (
      <PublicPageLayout>
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to {organizationName || 'Our Site'}
          </h1>
          <p className="mb-8 text-lg">{error}</p>
          <Link
            to="/login"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </PublicPageLayout>
    );
  }

  const renderData = pageData.content || { content: [], root: { props: {} } };

  return (
    <PublicPageLayout>
      <div className="w-full">
        <Render config={puckConfig} data={renderData} />
      </div>
    </PublicPageLayout>
  );
};

export default PublicHomepage;
