
import React, { useEffect, useState } from 'react';
import { useTenantContext } from '@/components/context/TenantContext';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useIndexState } from './hooks/useIndexState';
import { useMainDomainRedirect } from './hooks/useMainDomainRedirect';
import IndexLoadingState from './components/IndexLoadingState';
import LandingPage from '@/components/landing/LandingPage';
import SubdomainContent from './components/SubdomainContent';
import LoginDialog from '@/components/auth/LoginDialog';

const Index = () => {
  const { isSubdomainAccess, organizationId, isContextReady } = useTenantContext();
  const { isAuthenticated, isCheckingAuth } = useAuthStatus();
  const {
    showLoginDialog,
    setShowLoginDialog,
    shouldRedirect,
    setShouldRedirect,
    adminBarDismissed,
    handleDismissAdminBar,
    handleShowAdminBar
  } = useIndexState();
  
  const [loginDialogTab, setLoginDialogTab] = useState<'login' | 'signup'>('login');

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
  useMainDomainRedirect({
    isSubdomainAccess,
    isAuthenticated,
    isContextReady,
    setShouldRedirect
  });

  // Keyboard shortcut to toggle admin bar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        if (isAuthenticated) {
          const newDismissed = !adminBarDismissed;
          if (newDismissed) {
            handleDismissAdminBar();
          } else {
            handleShowAdminBar();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, adminBarDismissed, handleDismissAdminBar, handleShowAdminBar]);

  // Show loading until all states are ready
  if (!isContextReady || isCheckingAuth) {
    return <IndexLoadingState />;
  }

  // Helper functions to control login dialog
  const handleShowLogin = () => {
    setLoginDialogTab('login');
    setShowLoginDialog(true);
  };
  
  const handleShowSignup = () => {
    setLoginDialogTab('signup');
    setShowLoginDialog(true);
  };

  // For root domain - show the Church OS landing page with organization creation test
  if (!isSubdomainAccess) {
    return (
      <>
        <LandingPage 
          onShowLogin={handleShowLogin}
          onShowSignup={handleShowSignup} 
        />
        <LoginDialog 
          isOpen={showLoginDialog}
          setIsOpen={setShowLoginDialog}
          defaultTab={loginDialogTab}
        />
      </>
    );
  }

  // For subdomains - show subdomain content
  return (
    <SubdomainContent
      isAuthenticated={isAuthenticated}
      adminBarDismissed={adminBarDismissed}
      showLoginDialog={showLoginDialog}
      setShowLoginDialog={setShowLoginDialog}
      onDismissAdminBar={handleDismissAdminBar}
      onShowAdminBar={handleShowAdminBar}
    />
  );
};

export default Index;
