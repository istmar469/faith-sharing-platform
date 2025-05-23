
import React, { useState, useEffect } from 'react';
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
  const { organizationId, isLoading: orgIdLoading, setOrganizationId } = useOrganizationId(pageId);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showTemplatePrompt, setShowTemplatePrompt] = useState(false);
  
  console.log("PageBuilder: Context info", {
    contextOrgId,
    organizationId,
    urlOrgId,
    subdomain,
    isSubdomainAccess,
    pageId,
    pathname: window.location.pathname
  });
  
  // Use organization ID from URL or tenant context
  useEffect(() => {
    // Priority order: URL param, context, organization hook
    const effectiveOrgId = urlOrgId || contextOrgId || organizationId;
    
    console.log("PageBuilder: Setting organization ID with priority:", {
      urlOrgId,
      contextOrgId,
      hookOrgId: organizationId,
      effectiveOrgId
    });
    
    if (effectiveOrgId && !isSubdomainAccess) {
      console.log("PageBuilder: Using organization ID:", effectiveOrgId);
      setOrganizationId(effectiveOrgId);
      // Also update tenant context for consistency
      if (effectiveOrgId !== contextOrgId) {
        console.log("PageBuilder: Updating tenant context with organization ID:", effectiveOrgId);
        setTenantContext(effectiveOrgId, null, isSubdomainAccess);
      }
    }
  }, [urlOrgId, contextOrgId, organizationId, setOrganizationId, setTenantContext, isSubdomainAccess]);
  
  // Redirect to organization specific route if needed
  useEffect(() => {
    // If we're on /page-builder with no org ID in the URL but we have org context,
    // redirect to the organization-specific route
    if ((!urlOrgId) && (contextOrgId || organizationId) && !window.location.pathname.includes('/tenant-dashboard/')) {
      const targetOrgId = contextOrgId || organizationId;
      if (targetOrgId) {
        console.log("PageBuilder: Redirecting to organization-specific route:", targetOrgId);
        const newPath = `/tenant-dashboard/${targetOrgId}/page-builder${pageId ? `/${pageId}` : ''}`;
        navigate(newPath, { replace: true });
      }
    }
  }, [urlOrgId, contextOrgId, organizationId, pageId, navigate]);
  
  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        // Check if user is a super admin
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', (await supabase.auth.getUser()).data.user?.id)
          .single();
        
        if (!userError && userData?.role === 'super_admin') {
          setIsSuperAdmin(true);
        } else {
          // Also check using the super admin function
          const { data: isSuperAdminData } = await supabase.rpc('direct_super_admin_check');
          setIsSuperAdmin(!!isSuperAdminData);
        }
      } catch (err) {
        console.error("Error checking super admin status:", err);
      }
    };
    
    checkSuperAdmin();
  }, []);

  const handleAuthenticated = async (userId: string) => {
    if (orgIdLoading) return;
    
    try {
      setIsLoading(true);
      
      // Determine which organization ID to use with clear priority
      const effectiveOrgId = urlOrgId || contextOrgId || organizationId;
      
      console.log("PageBuilder: Loading page data with organization:", effectiveOrgId, {
        urlOrgId,
        contextOrgId,
        organizationId
      });
      
      if (effectiveOrgId) {
        const { pageData, error, showTemplatePrompt: showTemplate } = await loadPageData(pageId, effectiveOrgId);
        
        if (error) {
          console.error("PageBuilder: Error loading page data:", error);
          setPageLoadError(error);
          return;
        }
        
        console.log("PageBuilder: Successfully loaded page data:", pageData);
        setInitialPageData(pageData);
        setShowTemplatePrompt(showTemplate);
      } else {
        console.error("PageBuilder: No organization ID available");
        setPageLoadError("Could not determine organization ID. Please navigate from an organization dashboard.");
      }
    } catch (err) {
      console.error("PageBuilder: Error in handleAuthenticated:", err);
      setPageLoadError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotAuthenticated = () => {
    setIsLoading(false);
  };
  
  // Loading screen
  if (isLoading || orgIdLoading) {
    return <PageBuilderLoading />;
  }
  
  // Error screen for page loading issues
  if (pageLoadError && pageId) {
    const effectiveOrgId = urlOrgId || contextOrgId || organizationId;
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
          organizationId={urlOrgId || contextOrgId || organizationId}
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
