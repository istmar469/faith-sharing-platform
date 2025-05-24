
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTenantContext } from '../context/TenantContext';
import { usePageBuilderAuth } from './hooks/usePageBuilderAuth';
import { usePageBuilderState } from './hooks/usePageBuilderState';
import PageLoadError from './components/PageLoadError';
import PageBuilderLoading from './components/PageBuilderLoading';
import PageBuilderContainer from './components/PageBuilderContainer';

const PageBuilder = () => {
  const { pageId } = useParams<{ pageId?: string }>();
  const { organizationId, subdomain, isSubdomainAccess, isContextReady } = useTenantContext();
  
  // Enhanced debug logging
  useEffect(() => {
    console.log("=== PageBuilder Performance Monitor ===");
    console.log("PageBuilder: Current context", {
      pageId,
      organizationId,
      subdomain,
      isSubdomainAccess,
      isContextReady,
      pathname: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }, [pageId, organizationId, subdomain, isSubdomainAccess, isContextReady]);

  // Authentication handling
  const { isAuthenticated, authError, handleAuthenticated, handleNotAuthenticated } = usePageBuilderAuth({
    organizationId,
    isContextReady
  });

  // State management
  const {
    initialPageData,
    isLoading,
    pageLoadError,
    isSuperAdmin,
    showTemplatePrompt
  } = usePageBuilderState({
    pageId,
    organizationId,
    isAuthenticated
  });

  // Don't render anything until context is ready
  if (!isContextReady) {
    return <PageBuilderLoading message="Initializing..." />;
  }
  
  // Show auth error
  if (authError) {
    return <PageLoadError error={authError} organizationId={organizationId} />;
  }

  // Loading screen (waiting for authentication or page data)
  if (isAuthenticated === null || (isAuthenticated && isLoading)) {
    return <PageBuilderLoading />;
  }
  
  // Page load error
  if (pageLoadError) {
    return <PageLoadError error={pageLoadError} organizationId={organizationId} />;
  }
  
  // Main application
  return (
    <PageBuilderContainer
      initialPageData={initialPageData}
      isSuperAdmin={isSuperAdmin}
      organizationId={organizationId}
      showTemplatePrompt={showTemplatePrompt}
      subdomain={subdomain}
      isSubdomainAccess={isSubdomainAccess}
      onAuthenticated={handleAuthenticated}
      onNotAuthenticated={handleNotAuthenticated}
    />
  );
};

export default PageBuilder;
