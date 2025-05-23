
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
  
  // Debug logging
  useEffect(() => {
    console.log("PageBuilder: Current context", {
      pageId,
      organizationId,
      subdomain,
      isSubdomainAccess,
      pathname: window.location.pathname,
    });
  }, [pageId, organizationId, subdomain, isSubdomainAccess]);

  // Handle authenticated state
  const handleAuthenticated = useCallback(async (userId: string) => {
    console.log("PageBuilder: User authenticated, loading page data with org ID:", organizationId);
    
    if (!organizationId) {
      console.error("PageBuilder: No organization ID available for authenticated user");
      setPageLoadError("Could not determine organization ID. Please navigate from an organization dashboard.");
      setIsLoading(false);
      return;
    }

    try {
      // Check if user has access to this organization
      const { count, error: accessError } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('user_id', userId);
        
      if (accessError || count === 0) {
        console.error("PageBuilder: User does not have access to this organization");
        setPageLoadError("You do not have access to this organization");
        setIsLoading(false);
        return;
      }

      // Determine if we're working with an existing page or creating a new one
      const actualPageId = pageId && pageId !== ':pageId' ? pageId : null;
      
      // Load page data
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
      const { data: isAdmin } = await supabase.rpc('direct_super_admin_check');
      setIsSuperAdmin(!!isAdmin);
      
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
  
  // Loading timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn("PageBuilder: Loading timeout reached");
        setIsLoading(false);
        setPageLoadError("Loading timed out. Please try again.");
        toast("Loading timeout reached. Please try again.");
      }
    }, 5000); // Reduced timeout further
    
    return () => clearTimeout(timeout);
  }, [isLoading]);
  
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
