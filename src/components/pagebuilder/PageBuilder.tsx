
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PageBuilderProvider } from './context/PageBuilderContext';
import { PageData } from './context/types';
import { useOrganizationId } from './context/useOrganizationId';
import { loadPageData } from './utils/loadPageData';
import AuthenticationCheck from './components/AuthenticationCheck';
import PageLoadError from './components/PageLoadError';
import PageBuilderLoading from './components/PageBuilderLoading';
import PageBuilderLayout from './components/PageBuilderLayout';
import { useTenantContext } from '../context/TenantContext';

const PageBuilder = () => {
  const navigate = useNavigate();
  const { pageId, organizationId: urlOrgId } = useParams<{ pageId?: string; organizationId?: string }>();
  const { toast } = useToast();
  const [initialPageData, setInitialPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageLoadError, setPageLoadError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const { organizationId: contextOrgId, subdomain, isSubdomainAccess, setTenantContext } = useTenantContext();
  
  // Use urlOrgId as initialOrgId to prevent unnecessary loading
  const { organizationId, isLoading: orgIdLoading, setOrganizationId } = useOrganizationId(urlOrgId);
  
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showTemplatePrompt, setShowTemplatePrompt] = useState(false);
  
  console.log("PageBuilder: Context info", {
    contextOrgId,
    organizationId,
    urlOrgId,
    subdomain,
    isSubdomainAccess,
    pageId,
    pathname: window.location.pathname,
    isLoading,
    orgIdLoading,
  });
  
  // Determine effective organization ID with clear priority
  const effectiveOrgId = urlOrgId || contextOrgId || organizationId;
  
  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const { data: isSuperAdminData } = await supabase.rpc('direct_super_admin_check');
        setIsSuperAdmin(!!isSuperAdminData);
        console.log("PageBuilder: Super admin check result:", isSuperAdminData);
      } catch (err) {
        console.error("Error checking super admin status:", err);
      }
    };
    
    checkSuperAdmin();
  }, []);

  // Redirect to organization specific route if needed (only once)
  useEffect(() => {
    if ((!urlOrgId) && effectiveOrgId && !window.location.pathname.includes('/tenant-dashboard/')) {
      console.log("PageBuilder: Redirecting to organization-specific route:", effectiveOrgId);
      const newPath = `/tenant-dashboard/${effectiveOrgId}/page-builder${pageId ? `/${pageId}` : ''}`;
      navigate(newPath, { replace: true });
    }
  }, [urlOrgId, effectiveOrgId, pageId, navigate]);

  const handleAuthenticated = useCallback(async (userId: string) => {
    console.log("PageBuilder: handleAuthenticated called with effective org ID:", effectiveOrgId);
    
    if (!effectiveOrgId) {
      console.error("PageBuilder: No organization ID available");
      setPageLoadError("Could not determine organization ID. Please navigate from an organization dashboard.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      const { pageData, error, showTemplatePrompt: showTemplate } = await loadPageData(pageId, effectiveOrgId);
      
      if (error) {
        console.error("PageBuilder: Error loading page data:", error);
        setPageLoadError(error);
        setIsLoading(false);
        return;
      }
      
      console.log("PageBuilder: Successfully loaded page data:", pageData);
      setInitialPageData(pageData);
      setShowTemplatePrompt(showTemplate);
      setIsLoading(false);
    } catch (err) {
      console.error("PageBuilder: Error in handleAuthenticated:", err);
      setPageLoadError("An unexpected error occurred");
      setIsLoading(false);
    }
  }, [effectiveOrgId, pageId]);

  const handleNotAuthenticated = useCallback(() => {
    setIsLoading(false);
  }, []);
  
  // Loading screen - simplified logic
  if (isLoading && !pageLoadError) {
    return <PageBuilderLoading />;
  }
  
  // Error screen for page loading issues
  if (pageLoadError && pageId) {
    return <PageLoadError error={pageLoadError} organizationId={effectiveOrgId} />;
  }
  
  // The main application - wrap everything with PageBuilderProvider
  return (
    <AuthenticationCheck
      onAuthenticated={handleAuthenticated}
      onNotAuthenticated={handleNotAuthenticated}
    >
      <PageBuilderProvider initialPageData={initialPageData}>
        <PageBuilderLayout
          isSuperAdmin={isSuperAdmin}
          organizationId={effectiveOrgId}
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
