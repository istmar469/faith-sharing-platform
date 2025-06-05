import React, { useState, useEffect } from 'react';
import { useTenantContext } from '@/components/context/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import SubdomainPage from '@/components/subdomain/SubdomainPage';
import IndexLoadingState from './IndexLoadingState';

interface HomepageData {
  id: string;
  title: string;
  content: any;
}

interface SubdomainContentProps {
  isAuthenticated: boolean;
  adminBarDismissed: boolean;
  showLoginDialog: boolean;
  setShowLoginDialog: (show: boolean) => void;
  onDismissAdminBar: () => void;
  onShowAdminBar: () => void;
}

const SubdomainContent: React.FC<SubdomainContentProps> = ({
  isAuthenticated,
  adminBarDismissed,
  showLoginDialog,
  setShowLoginDialog,
  onDismissAdminBar,
  onShowAdminBar
}) => {
  const { organizationId, isContextReady } = useTenantContext();
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomepage = async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }
      
      // Reset loading state when fetching
      setLoading(true);
      setError(null);

      try {
        console.log('SubdomainContent: Fetching homepage for org:', organizationId, 'authenticated:', isAuthenticated);
        
        const { data: page, error } = await supabase
          .from('pages')
          .select('id, title, content')
          .eq('organization_id', organizationId)
          .eq('is_homepage', true)
          .eq('published', true)
          .maybeSingle();

        if (error) {
          console.error('SubdomainContent: Error fetching homepage:', error);
          setError(`Error loading homepage: ${error.message}`);
        } else if (page) {
          console.log('SubdomainContent: Found homepage:', page.title);
          console.log('SubdomainContent: Content type:', typeof page.content);
          console.log('SubdomainContent: Content preview:', page.content);
          setHomepageData(page);
        } else {
          console.log('SubdomainContent: No published homepage found for org:', organizationId);
          setHomepageData(null);
        }
      } catch (err) {
        console.error('SubdomainContent: Exception fetching homepage:', err);
        setError('Failed to load homepage');
      } finally {
        setLoading(false);
      }
    };

    if (isContextReady) {
      fetchHomepage();
    }
  }, [organizationId, isContextReady, isAuthenticated]);

  // For subdomains - handle loading state
  if (loading) {
    return <IndexLoadingState />;
  }

  // For subdomains - show content
  return (
    <div className="min-h-screen bg-white">
      <SubdomainPage 
        homepageData={homepageData}
        adminBarOffset={false}
        error={error}
      />
    </div>
  );
};

export default SubdomainContent;
