
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

  // Optimized: Wait for context to be ready
  useEffect(() => {
    if (!isContextReady) {
      console.log("PageBuilder: Waiting for tenant context...");
      return;
    }
    console.log("PageBuilder: Context ready, starting authentication");
    setIsLoading(true);
  }, [isContextReady]);

  // Optimized authentication handler with reduced database calls
  const handleAuthenticated = useCallback(async (userId: string) => {
    console.log("=== PageBuilder: Authentication Success ===");
    const authStartTime = Date.now();
    
    if (!isContextReady || !organizationId) {
      console.error("PageBuilder: Missing context or organization ID");
      setPageLoadError("Could not determine organization context");
      setIsLoading(false);
      return;
    }

    try {
      // Simplified access check - just verify membership
      console.log("PageBuilder: Checking user access...");
      const accessCheckStart = Date.now();
      
      const { count, error: accessError } = await Promise.race([
        supabase
          .from('organization_members')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .eq('user_id', userId),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Access check timeout')), 2000)
        )
      ]) as any;
      
      const accessCheckTime = Date.now() - accessCheckStart;
      console.log(`PageBuilder: Access check completed in ${accessCheckTime}ms`);
        
      if (accessError || count === 0) {
        console.error("PageBuilder: Access denied", { accessError, count });
        setPageLoadError("You do not have access to this organization");
        setIsLoading(false);
        return;
      }

      // Load page data
      console.log("PageBuilder: Loading page data...");
      const pageDataStart = Date.now();
      const actualPageId = pageId && pageId !== ':pageId' ? pageId : null;
      
      const { pageData, error, showTemplatePrompt: showTemplate } = await loadPageData(actualPageId, organizationId);
      
      const pageDataTime = Date.now() - pageDataStart;
      console.log(`PageBuilder: Page data loaded in ${pageDataTime}ms`);
      
      if (error) {
        console.error("PageBuilder: Page data error:", error);
        setPageLoadError(error);
      } else {
        console.log("PageBuilder: Page data loaded successfully");
        setInitialPageData(pageData);
        setShowTemplatePrompt(showTemplate);
      }
      
      // Quick super admin check (non-blocking)
      setTimeout(async () => {
        try {
          const { data: isAdmin } = await Promise.race([
            supabase.rpc('direct_super_admin_check'),
            new Promise((resolve) => setTimeout(() => resolve({ data: false }), 1000))
          ]) as any;
          setIsSuperAdmin(!!isAdmin);
        } catch (err) {
          console.log("PageBuilder: Super admin check failed, defaulting to false");
          setIsSuperAdmin(false);
        }
      }, 0);
      
      const totalAuthTime = Date.now() - authStartTime;
      console.log(`PageBuilder: Total authentication flow: ${totalAuthTime}ms`);
      setIsLoading(false);
      
    } catch (err) {
      const totalAuthTime = Date.now() - authStartTime;
      console.error(`PageBuilder: Authentication error after ${totalAuthTime}ms:`, err);
      setPageLoadError(`Error loading page builder: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [organizationId, pageId, isContextReady]);

  const handleNotAuthenticated = useCallback(() => {
    console.log("PageBuilder: User not authenticated");
    setIsLoading(false);
    setPageLoadError("You must be logged in to access the page builder");
  }, []);
  
  // Reduced timeout to 2 seconds for faster feedback
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading && isContextReady) {
        console.warn("PageBuilder: Loading timeout reached after 2 seconds");
        setIsLoading(false);
        setPageLoadError("Loading timed out. Please check your connection and try again.");
        toast("Page builder loading timed out. Please refresh and try again.");
      }
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [isLoading, isContextReady]);
  
  // Don't render anything until context is ready
  if (!isContextReady) {
    return <PageBuilderLoading message="Initializing..." />;
  }
  
  // Loading screen
  if (isLoading) {
    return <PageBuilderLoading />;
  }
  
  // Error screen
  if (pageLoadError) {
    return <PageLoadError error={pageLoadError} organizationId={organizationId} />;
  }
  
  // Main application
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
