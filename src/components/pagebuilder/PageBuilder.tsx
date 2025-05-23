
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PageBuilderProvider } from './context/PageBuilderContext';
import { PageData } from './context/types';
import { loadPageData } from './utils/loadPageData';
import AuthenticationCheck from './components/AuthenticationCheck';
import PageLoadError from './components/PageLoadError';
import PageBuilderLoading from './components/PageBuilderLoading';
import PageBuilderLayout from './components/PageBuilderLayout';
import { useTenantContext } from '../context/TenantContext';
import { toast } from 'sonner';

const PageBuilder = () => {
  const navigate = useNavigate();
  const { pageId } = useParams<{ pageId?: string }>();
  const { toast: toastUtil } = useToast();
  const [initialPageData, setInitialPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageLoadError, setPageLoadError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const { organizationId, subdomain, isSubdomainAccess, isContextReady } = useTenantContext();
  
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showTemplatePrompt, setShowTemplatePrompt] = useState(false);
  
  // Enhanced debug logging
  useEffect(() => {
    console.log("=== PageBuilder Debug Info ===");
    console.log("PageBuilder: Current context", {
      pageId,
      organizationId,
      subdomain,
      isSubdomainAccess,
      isContextReady,
      pathname: window.location.pathname,
      timestamp: new Date().toISOString()
    });
    console.log("PageBuilder: Component state", {
      isLoading,
      pageLoadError,
      hasInitialPageData: !!initialPageData
    });
  }, [pageId, organizationId, subdomain, isSubdomainAccess, isContextReady, isLoading, pageLoadError, initialPageData]);

  // Wait for context to be ready before proceeding
  useEffect(() => {
    if (!isContextReady) {
      console.log("PageBuilder: Waiting for tenant context to be ready...");
      return;
    }

    console.log("PageBuilder: Context is ready, proceeding with authentication check");
    setIsLoading(true);
  }, [isContextReady]);

  // Handle authenticated state
  const handleAuthenticated = useCallback(async (userId: string) => {
    console.log("=== PageBuilder: Authentication Success ===");
    console.log("PageBuilder: User authenticated, proceeding with context", {
      userId,
      organizationId,
      isContextReady
    });

    // Ensure we have context ready
    if (!isContextReady) {
      console.log("PageBuilder: Context not ready yet, waiting...");
      return;
    }
    
    if (!organizationId) {
      console.error("PageBuilder: No organization ID available for authenticated user");
      setPageLoadError("Could not determine organization ID. Please navigate from an organization dashboard or check subdomain configuration.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("PageBuilder: Checking user access to organization...");
      
      // Add timeout to access check
      const accessCheckPromise = supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('user_id', userId);
        
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Access check timeout')), 5000)
      );
      
      const { count, error: accessError } = await Promise.race([
        accessCheckPromise,
        timeoutPromise
      ]) as any;
        
      if (accessError || count === 0) {
        console.error("PageBuilder: User does not have access to this organization", { accessError, count });
        setPageLoadError("You do not have access to this organization");
        setIsLoading(false);
        return;
      }

      console.log("PageBuilder: User has access, proceeding with page data load...");

      // Determine if we're working with an existing page or creating a new one
      const actualPageId = pageId && pageId !== ':pageId' ? pageId : null;
      console.log("PageBuilder: Actual page ID:", actualPageId);
      
      // Load page data with timeout
      console.log("PageBuilder: Loading page data...");
      const loadDataPromise = loadPageData(actualPageId, organizationId);
      const loadTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Page data loading timeout')), 10000)
      );
      
      const { pageData, error, showTemplatePrompt: showTemplate } = await Promise.race([
        loadDataPromise,
        loadTimeoutPromise
      ]) as any;
      
      if (error) {
        console.error("PageBuilder: Error loading page data:", error);
        setPageLoadError(error);
      } else {
        console.log("PageBuilder: Successfully loaded page data:", pageData);
        setInitialPageData(pageData);
        setShowTemplatePrompt(showTemplate);
      }
      
      // Check if user is super admin (with timeout)
      console.log("PageBuilder: Checking super admin status...");
      const adminCheckPromise = supabase.rpc('direct_super_admin_check');
      const adminTimeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve({ data: false }), 3000)
      );
      
      const { data: isAdmin } = await Promise.race([
        adminCheckPromise,
        adminTimeoutPromise
      ]) as any;
      
      setIsSuperAdmin(!!isAdmin);
      console.log("PageBuilder: Super admin status:", !!isAdmin);
      
      console.log("PageBuilder: Authentication flow complete, setting loading to false");
      setIsLoading(false);
    } catch (err) {
      console.error("PageBuilder: Error in handleAuthenticated:", err);
      setPageLoadError(`Error loading page builder: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [organizationId, pageId, isContextReady]);

  const handleNotAuthenticated = useCallback(() => {
    console.log("PageBuilder: User not authenticated");
    setIsLoading(false);
    setPageLoadError("You must be logged in to access the page builder");
  }, []);
  
  // Aggressive loading timeout to 3 seconds for immediate feedback
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading && isContextReady) {
        console.warn("PageBuilder: Loading timeout reached after 3 seconds");
        setIsLoading(false);
        setPageLoadError("Loading timed out. This may be a database connection issue. Please try again.");
        toast("Page builder loading timed out. Please refresh and try again.");
      }
    }, 3000); // Further reduced from 5 seconds to 3 seconds
    
    return () => clearTimeout(timeout);
  }, [isLoading, isContextReady]);
  
  // Don't render anything until context is ready
  if (!isContextReady) {
    console.log("PageBuilder: Waiting for context to be ready");
    return <PageBuilderLoading message="Initializing organization context..." />;
  }
  
  // Loading screen
  if (isLoading) {
    console.log("PageBuilder: Rendering loading state");
    return <PageBuilderLoading />;
  }
  
  // Error screen
  if (pageLoadError) {
    console.log("PageBuilder: Rendering error state:", pageLoadError);
    return <PageLoadError error={pageLoadError} organizationId={organizationId} />;
  }
  
  // Main application
  console.log("PageBuilder: Rendering main application");
  return (
    <AuthenticationCheck
      onAuthenticated={handleAuthenticated}
      onNotAuthenticated={handleNotAuthenticated}
    >
      <PageBuilderProvider initialPageData={initialPageData}>
        <PageBuilderLayout
          isSuperAdmin={isSuperAdmin}
          organizationId={organizationId}
          pageData={initialPageData}
          showTemplatePrompt={showTemplatePrompt}
          debugMode={debugMode}
          subdomain={subdomain}
          isSubdomainAccess={isSubdomainAccess}
        />
      </PageBuilderProvider>
    </AuthenticationCheck>
  );
};

export default PageBuilder;
