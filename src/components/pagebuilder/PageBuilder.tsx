
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
  
  console.log("PageBuilder: Initial render", {
    contextOrgId,
    urlOrgId,
    subdomain,
    isSubdomainAccess,
    pageId,
    pathname: window.location.pathname,
    isLoading,
  });
  
  // Optimized organization ID resolution - only run once per mount
  useEffect(() => {
    const resolveOrganizationId = async () => {
      console.log("PageBuilder: Resolving organization ID");
      
      // Priority: URL param > context > subdomain lookup
      if (urlOrgId) {
        console.log("PageBuilder: Using URL param org ID:", urlOrgId);
        setEffectiveOrgId(urlOrgId);
        return;
      }
      
      if (contextOrgId) {
        console.log("PageBuilder: Using context org ID:", contextOrgId);
        setEffectiveOrgId(contextOrgId);
        return;
      }
      
      // If we have a subdomain but no context, look up organization
      if (isSubdomainAccess && subdomain) {
        console.log("PageBuilder: Looking up org ID by subdomain:", subdomain);
        try {
          const { data: orgData, error } = await supabase
            .from('organizations')
            .select('id, name')
            .eq('subdomain', subdomain)
            .single();
            
          if (orgData) {
            console.log("PageBuilder: Found org by subdomain:", orgData.id);
            setEffectiveOrgId(orgData.id);
            setTenantContext(orgData.id, orgData.name, true);
          } else {
            console.error("PageBuilder: Error finding org by subdomain:", error);
          }
        } catch (error) {
          console.error('Error looking up organization by subdomain:', error);
        }
      } else {
        console.warn("PageBuilder: Could not determine organization ID");
      }
    };
    
    resolveOrganizationId();
  }, []); // Empty dependency array ensures this only runs once

  // Redirect to organization specific route if needed - separate effect
  useEffect(() => {
    if (!urlOrgId && effectiveOrgId && effectiveOrgId !== 'undefined' && !window.location.pathname.includes('/tenant-dashboard/')) {
      console.log("PageBuilder: Redirecting to organization-specific route:", effectiveOrgId);
      const newPath = `/tenant-dashboard/${effectiveOrgId}/page-builder${pageId ? `/${pageId}` : ''}`;
      navigate(newPath, { replace: true });
    }
  }, [urlOrgId, effectiveOrgId, pageId, navigate]);

  // Handle authenticated state - simplified and separate from organization resolution
  const handleAuthenticated = useCallback(async (userId: string) => {
    console.log("PageBuilder: User authenticated, loading page data with org ID:", effectiveOrgId);
    
    if (!effectiveOrgId || effectiveOrgId === 'undefined') {
      console.error("PageBuilder: No organization ID available for authenticated user");
      setPageLoadError("Could not determine organization ID. Please navigate from an organization dashboard.");
      setIsLoading(false);
      return;
    }

    try {
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
      
      // Set loading to false regardless of outcome
      setIsLoading(false);
    } catch (err) {
      console.error("PageBuilder: Error in handleAuthenticated:", err);
      setPageLoadError("An unexpected error occurred loading page data");
      setIsLoading(false);
    }
  }, [effectiveOrgId, pageId]);

  const handleNotAuthenticated = useCallback(() => {
    console.log("PageBuilder: User not authenticated");
    setIsLoading(false);
  }, []);
  
  // Add a timeout to prevent infinite loading states
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn("PageBuilder: Loading timeout reached, forcing load completion");
        setIsLoading(false);
        setPageLoadError("Loading timed out. Please try again or check your connection.");
      }
    }, 15000); // 15 second timeout
    
    return () => clearTimeout(timeout);
  }, [isLoading]);
  
  // Loading screen - simplified logic
  if (isLoading && !pageLoadError) {
    return <PageBuilderLoading />;
  }
  
  // Error screen for page loading issues
  if (pageLoadError) {
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
