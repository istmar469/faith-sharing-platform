
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import LandingPage from '@/components/landing/LandingPage';
import SubdomainPage from '@/components/subdomain/SubdomainPage';
import AdminBar from '@/components/admin/AdminBar';
import FloatingAdminButton from '@/components/admin/FloatingAdminButton';
import FloatingLoginButton from '@/components/admin/FloatingLoginButton';
import LoginDialog from '@/components/auth/LoginDialog';

interface HomepageData {
  id: string;
  title: string;
  content: any;
}

const Index = () => {
  const navigate = useNavigate();
  const { isSubdomainAccess, organizationName, organizationId, isContextReady } = useTenantContext();
  const { isAuthenticated, isCheckingAuth } = useAuthStatus();
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [adminBarDismissed, setAdminBarDismissed] = useState(() => {
    return localStorage.getItem('adminBarDismissed') === 'true';
  });

  // Add debug logging for state tracking
  useEffect(() => {
    console.log('Index: State update', {
      isSubdomainAccess,
      isContextReady,
      isAuthenticated,
      isCheckingAuth,
      adminBarDismissed,
      organizationId,
      hostname: window.location.hostname
    });
  }, [isSubdomainAccess, isContextReady, isAuthenticated, isCheckingAuth, adminBarDismissed, organizationId]);

  // Handle authenticated users on main domain
  useEffect(() => {
    const checkRedirectForMainDomain = async () => {
      // Only check for redirect on main domain and when user is authenticated
      if (!isSubdomainAccess && isAuthenticated && isContextReady) {
        try {
          // Check if user has organizations or is super admin
          const { data: isSuperAdminData } = await supabase.rpc('direct_super_admin_check');
          const { data: userOrgs } = await supabase.rpc('rbac_fetch_user_organizations');
          
          // If user has orgs or is super admin, they should probably be redirected to dashboard
          if (isSuperAdminData || (userOrgs && userOrgs.length > 0)) {
            console.log('Index: Authenticated user on main domain with orgs/admin access, considering redirect');
            setShouldRedirect(true);
          }
        } catch (error) {
          console.error('Index: Error checking user status:', error);
        }
      }
    };

    checkRedirectForMainDomain();
  }, [isSubdomainAccess, isAuthenticated, isContextReady]);

  useEffect(() => {
    const fetchHomepage = async () => {
      // Only fetch homepage data for subdomains
      if (!isSubdomainAccess || !organizationId) {
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
  }, [organizationId, isSubdomainAccess, isContextReady]);

  const handleDismissAdminBar = () => {
    setAdminBarDismissed(true);
    localStorage.setItem('adminBarDismissed', 'true');
  };

  const handleShowAdminBar = () => {
    setAdminBarDismissed(false);
    localStorage.setItem('adminBarDismissed', 'false');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  // Keyboard shortcut to toggle admin bar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        if (isAuthenticated) {
          setAdminBarDismissed(!adminBarDismissed);
          localStorage.setItem('adminBarDismissed', (!adminBarDismissed).toString());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, adminBarDismissed]);

  // Show loading until all states are ready
  if (!isContextReady || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // For root domain - show the modern Church OS landing page
  if (!isSubdomainAccess) {
    return (
      <div className="min-h-screen bg-white">
        {/* Admin bar for authenticated users on root domain */}
        {isAuthenticated && !adminBarDismissed && (
          <AdminBar 
            isSubdomainAccess={false}
            onDismiss={handleDismissAdminBar}
          />
        )}

        {/* Floating admin button when bar is dismissed */}
        {isAuthenticated && adminBarDismissed && (
          <FloatingAdminButton onShowAdminBar={handleShowAdminBar} />
        )}

        {/* Non-authenticated users get a login button */}
        {!isAuthenticated && (
          <FloatingLoginButton onShowLogin={() => setShowLoginDialog(true)} />
        )}

        {/* Show dashboard button for authenticated users */}
        {isAuthenticated && shouldRedirect && (
          <div className="fixed top-4 right-4 z-50">
            <button
              onClick={handleGoToDashboard}
              className="bg-primary text-white px-4 py-2 rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className={`${isAuthenticated && !adminBarDismissed ? 'pt-12' : ''}`}>
          <LandingPage onShowLogin={() => setShowLoginDialog(true)} />
        </div>

        <LoginDialog isOpen={showLoginDialog} setIsOpen={setShowLoginDialog} />
      </div>
    );
  }

  // For subdomains - handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // For subdomains - show content with admin overlay
  return (
    <div className="min-h-screen bg-white relative">
      {/* Admin overlay for authenticated users on subdomains */}
      {isAuthenticated && !adminBarDismissed && (
        <AdminBar 
          isSubdomainAccess={true}
          homepageData={homepageData}
          onDismiss={handleDismissAdminBar}
        />
      )}

      {/* Floating admin button when bar is dismissed */}
      {isAuthenticated && adminBarDismissed && (
        <FloatingAdminButton onShowAdminBar={handleShowAdminBar} />
      )}

      {/* Non-authenticated users get a login button */}
      {!isAuthenticated && (
        <FloatingLoginButton onShowLogin={() => setShowLoginDialog(true)} />
      )}

      {/* Subdomain content */}
      <SubdomainPage 
        homepageData={homepageData}
        adminBarOffset={isAuthenticated && !adminBarDismissed}
      />

      <LoginDialog isOpen={showLoginDialog} setIsOpen={setShowLoginDialog} />
    </div>
  );
};

export default Index;
