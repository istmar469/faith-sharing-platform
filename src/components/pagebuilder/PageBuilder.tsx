
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTenantContext } from '../context/TenantContext';
import { PageManagerProvider } from './context/PageManagerProvider';
import PageBuilderWithManager from './components/PageBuilderWithManager';
import PageBuilderLoading from './components/PageBuilderLoading';

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

  // Don't render anything until context is ready
  if (!isContextReady) {
    return <PageBuilderLoading message="Initializing..." />;
  }

  // Determine the actual page ID
  const actualPageId = pageId && pageId !== ':pageId' ? pageId : null;

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
