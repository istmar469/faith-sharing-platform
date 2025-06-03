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

  useEffect(() => {
    const fetchHomepage = async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }

      try {
        console.log('Index: Fetching homepage for subdomain org:', organizationId);
        
        const { data: page, error } = await supabase
          .from('pages')
          .select('id, title, content')
          .eq('organization_id', organizationId)
          .eq('is_homepage', true)
          .eq('published', true)
          .maybeSingle();

        if (error) {
          console.error('Index: Error fetching homepage:', error);
        } else if (page) {
          console.log('Index: Found homepage:', page.title);
          setHomepageData(page);
        } else {
          console.log('Index: No published homepage found for subdomain');
        }
      } catch (err) {
        console.error('Index: Exception fetching homepage:', err);
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

  // For subdomains - show content with admin overlay
  return (
    <div className="min-h-screen bg-white relative">
      {/* Subdomain content */}
      <SubdomainPage 
        homepageData={homepageData}
        adminBarOffset={false}
      />

      <LoginDialog isOpen={showLoginDialog} setIsOpen={setShowLoginDialog} />
    </div>
  );
};

export default SubdomainContent;
