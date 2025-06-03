
import React, { useState, useEffect } from 'react';
import { useTenantContext } from '@/components/context/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import SubdomainPage from '@/components/subdomain/SubdomainPage';
import AdminBar from '@/components/admin/AdminBar';
import FloatingAdminButton from '@/components/admin/FloatingAdminButton';
import FloatingLoginButton from '@/components/admin/FloatingLoginButton';
import LoginDialog from '@/components/auth/LoginDialog';
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

      try {
        console.log('SubdomainContent: Fetching homepage for subdomain org:', organizationId);
        
        const { data: page, error: fetchError } = await supabase
          .from('pages')
          .select('id, title, content')
          .eq('organization_id', organizationId)
          .eq('is_homepage', true)
          .eq('published', true)
          .maybeSingle(); // Changed from .single() to .maybeSingle()

        if (fetchError) {
          console.error('SubdomainContent: Error fetching homepage:', fetchError);
          setError('Failed to load homepage');
        } else if (page) {
          console.log('SubdomainContent: Found homepage:', page.title);
          setHomepageData(page);
        } else {
          console.log('SubdomainContent: No published homepage found for subdomain');
          // This is not an error, just no homepage exists yet
        }
      } catch (err) {
        console.error('SubdomainContent: Exception fetching homepage:', err);
        setError('An unexpected error occurred while loading the homepage');
      } finally {
        setLoading(false);
      }
    };

    // Wait for context to be ready before proceeding
    if (isContextReady) {
      fetchHomepage();
    }
  }, [organizationId, isContextReady]);

  // For subdomains - handle loading state
  if (loading) {
    return <IndexLoadingState />;
  }

  // For subdomains - show content with admin overlay (even if there's an error)
  return (
    <div className="min-h-screen bg-white relative">
      {/* Subdomain content */}
      <SubdomainPage 
        homepageData={homepageData}
        adminBarOffset={false}
        error={error}
      />

      <LoginDialog isOpen={showLoginDialog} setIsOpen={setShowLoginDialog} />
    </div>
  );
};

export default SubdomainContent;
