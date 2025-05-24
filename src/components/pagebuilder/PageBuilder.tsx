
import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useTenantContext } from '../context/TenantContext';
import { PageManagerProvider } from './context/PageManagerProvider';
import PageBuilderWithManager from './components/PageBuilderWithManager';
import PageBuilderLoading from './components/PageBuilderLoading';

const PageBuilder = () => {
  const { pageId } = useParams<{ pageId?: string }>();
  const { organizationId, subdomain, isSubdomainAccess, isContextReady } = useTenantContext();
  const location = useLocation();
  
  // Enhanced debug logging
  useEffect(() => {
    console.log("=== PageBuilder: State Monitor ===");
    console.log("PageBuilder: Current state", {
      pageId,
      organizationId,
      subdomain,
      isSubdomainAccess,
      isContextReady,
      pathname: location.pathname,
      search: location.search,
      timestamp: new Date().toISOString()
    });
  }, [pageId, organizationId, subdomain, isSubdomainAccess, isContextReady, location]);

  // Wait for context to be ready
  if (!isContextReady) {
    console.log("PageBuilder: Context not ready, showing loading state");
    return <PageBuilderLoading message="Initializing application context..." />;
  }

  // For subdomain access, we need an organizationId from context
  if (isSubdomainAccess && !organizationId) {
    console.error("PageBuilder: Subdomain access but no organization ID available");
    return <PageBuilderLoading message="Loading organization context..." />;
  }

  // Determine the actual page ID
  const actualPageId = pageId && pageId !== ':pageId' ? pageId : null;

  console.log("PageBuilder: Rendering with final parameters", {
    actualPageId,
    organizationId,
    isSubdomainAccess,
    subdomain
  });

  return (
    <PageManagerProvider 
      pageId={actualPageId}
      organizationId={organizationId}
      isContextReady={isContextReady}
    >
      <PageBuilderWithManager 
        subdomain={subdomain}
        isSubdomainAccess={isSubdomainAccess}
      />
    </PageManagerProvider>
  );
};

export default PageBuilder;
