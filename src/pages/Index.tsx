
import React, { useEffect } from 'react';
import { useTenantContext } from '@/components/context/TenantContext';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useIndexState } from './hooks/useIndexState';
import { useMainDomainRedirect } from './hooks/useMainDomainRedirect';
import IndexLoadingState from './components/IndexLoadingState';
import MainDomainContent from './components/MainDomainContent';
import SubdomainContent from './components/SubdomainContent';

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

  // For root domain - show the modern Church OS landing page
  if (!isSubdomainAccess) {
    return (
      <MainDomainContent
        isAuthenticated={isAuthenticated}
        adminBarDismissed={adminBarDismissed}
        shouldRedirect={shouldRedirect}
        showLoginDialog={showLoginDialog}
        setShowLoginDialog={setShowLoginDialog}
        onDismissAdminBar={handleDismissAdminBar}
        onShowAdminBar={handleShowAdminBar}
      />
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
