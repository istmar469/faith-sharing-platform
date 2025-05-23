
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
  const { organizationId, subdomain, isSubdomainAccess } = useTenantContext();
  
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
      pathname: window.location.pathname,
      timestamp: new Date().toISOString()
    });
    console.log("PageBuilder: Component state", {
      isLoading,
      pageLoadError,
      hasInitialPageData: !!initialPageData
    });
  }, [pageId, organizationId, subdomain, isSubdomainAccess, isLoading, pageLoadError, initialPageData]);

  // Handle authenticated state
  const handleAuthenticated = useCallback(async (userId: string) => {
    console.log("=== Authentication Success ===");
    console.log("PageBuilder: User authenticated, loading page data with org ID:", organizationId);
    console.log("PageBuilder: User ID:", userId);
    
    if (!organizationId) {
      console.error("PageBuilder: No organization ID available for authenticated user");
      setPageLoadError("Could not determine organization ID. Please navigate from an organization dashboard.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("PageBuilder: Checking user access to organization...");
      // Check if user has access to this organization
      const { count, error: accessError } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('user_id', userId);
        
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
      
      // Load page data
      console.log("PageBuilder: Loading page data...");
      const { pageData, error, showTemplatePrompt: showTemplate } = await loadPageData(actualPageId, organizationId);
      
      if (error) {
        console.error("PageBuilder: Error loading page data:", error);
        setPageLoadError(error);
      } else {
        console.log("PageBuilder: Successfully loaded page data:", pageData);
        setInitialPageData(pageData);
        setShowTemplatePrompt(showTemplate);
      }
      
      // Check if user is super admin
      console.log("PageBuilder: Checking super admin status...");
      const { data: isAdmin } = await supabase.rpc('direct_super_admin_check');
      setIsSuperAdmin(!!isAdmin);
      console.log("PageBuilder: Super admin status:", !!isAdmin);
      
      console.log("PageBuilder: Authentication flow complete, setting loading to false");
      setIsLoading(false);
    } catch (err) {
      console.error("PageBuilder: Error in handleAuthenticated:", err);
      setPageLoadError("An unexpected error occurred loading page data");
      setIsLoading(false);
    }
  }, [organizationId, pageId]);

  const handleNotAuthenticated = useCallback(() => {
    console.log("PageBuilder: User not authenticated");
    setIsLoading(false);
    setPageLoadError("You must be logged in to access the page builder");
  }, []);
  
  // Increased loading timeout to match PageCanvas
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn("PageBuilder: Loading timeout reached after 15 seconds");
        setIsLoading(false);
        setPageLoadError("Loading timed out. Please try again.");
        toast("Page builder loading timed out. Please refresh and try again.");
      }
    }, 15000); // Increased from 5 to 15 seconds to match PageCanvas
    
    return () => clearTimeout(timeout);
  }, [isLoading]);
  
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
