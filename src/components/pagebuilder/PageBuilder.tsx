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
import { ContextAwareApi } from '@/utils/contextAwareApi';

const PageBuilder = () => {
  const navigate = useNavigate();
  const { pageId, organizationId: urlOrgId } = useParams<{ pageId?: string; organizationId?: string }>();
  const { toast } = useToast();
  const [initialPageData, setInitialPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageLoadError, setPageLoadError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const { organizationId: contextOrgId, subdomain, isSubdomainAccess, setTenantContext } = useTenantContext();
  
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showTemplatePrompt, setShowTemplatePrompt] = useState(false);
  const [effectiveOrgId, setEffectiveOrgId] = useState<string | null>(null);
  
  console.log("PageBuilder: Context info", {
    contextOrgId,
    urlOrgId,
    subdomain,
    isSubdomainAccess,
    pageId,
    pathname: window.location.pathname,
    isLoading,
  });
  
  // Optimized organization ID resolution
  useEffect(() => {
    const resolveOrganizationId = async () => {
      // Priority: URL param > context > subdomain lookup
      if (urlOrgId) {
        setEffectiveOrgId(urlOrgId);
        return;
      }
      
      if (contextOrgId) {
        setEffectiveOrgId(contextOrgId);
        return;
      }
      
      // If we have a subdomain but no context, look up organization
      if (isSubdomainAccess && subdomain) {
        try {
          const { data: orgData } = await supabase
            .from('organizations')
            .select('id, name')
            .eq('subdomain', subdomain)
            .single();
            
          if (orgData) {
            setEffectiveOrgId(orgData.id);
            setTenantContext(orgData.id, orgData.name, true);
          }
        } catch (error) {
          console.error('Error looking up organization by subdomain:', error);
        }
      }
    };
    
    resolveOrganizationId();
  }, [urlOrgId, contextOrgId, subdomain, isSubdomainAccess, setTenantContext]);

  // Redirect to organization specific route if needed
  useEffect(() => {
    if (!urlOrgId && effectiveOrgId && !window.location.pathname.includes('/tenant-dashboard/')) {
      console.log("PageBuilder: Redirecting to organization-specific route:", effectiveOrgId);
      const newPath = `/tenant-dashboard/${effectiveOrgId}/page-builder${pageId ? `/${pageId}` : ''}`;
      navigate(newPath, { replace: true });
    }
  }, [urlOrgId, effectiveOrgId, pageId, navigate]);

  // Simplified handler for authenticated state
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
      
      // Load page data
      const { pageData, error, showTemplatePrompt: showTemplate } = await loadPageData(pageId, effectiveOrgId);
      
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
