
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
  const { pageId, organizationId: urlOrgId } = useParams<{ pageId?: string; organizationId?: string }>();
  const { toast: toastUtil } = useToast();
  const [initialPageData, setInitialPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageLoadError, setPageLoadError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const { organizationId: contextOrgId, subdomain, isSubdomainAccess, setTenantContext } = useTenantContext();
  
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showTemplatePrompt, setShowTemplatePrompt] = useState(false);
  const [effectiveOrgId, setEffectiveOrgId] = useState<string | null>(null);
  
  // Debug logging
  useEffect(() => {
    console.log("PageBuilder: Current route params", {
      pageId,
      urlOrgId,
      pathname: window.location.pathname,
    });
  }, [pageId, urlOrgId]);
  
  // Optimized organization ID resolution - only run once per mount
  useEffect(() => {
    const resolveOrganizationId = async () => {
      console.log("PageBuilder: Resolving organization ID");
      
      // Priority: URL param > context > subdomain lookup
      if (urlOrgId && urlOrgId !== ':organizationId') {
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
            setPageLoadError("Could not find organization for this subdomain");
          }
        } catch (error) {
          console.error('Error looking up organization by subdomain:', error);
          setPageLoadError("Error looking up organization");
        }
      } else if (!urlOrgId || urlOrgId === ':organizationId') {
        console.warn("PageBuilder: Could not determine organization ID from URL param or subdomain");
        setPageLoadError("Could not determine organization ID. Please navigate from an organization dashboard.");
      }
    };
    
    resolveOrganizationId();
  }, [contextOrgId, isSubdomainAccess, subdomain, urlOrgId, setTenantContext]);

  // Redirect to organization specific route if needed - separate effect
  useEffect(() => {
    // Don't redirect if we don't have effective org ID or if URL contains a literal :organizationId param
    if (!effectiveOrgId || urlOrgId === ':organizationId' || !urlOrgId) return;
    
    // Don't redirect if already on the correct organization route
    if (urlOrgId === effectiveOrgId) return;
    
    console.log("PageBuilder: Redirecting to organization-specific route:", effectiveOrgId);
    const newPath = `/tenant-dashboard/${effectiveOrgId}/page-builder${pageId && pageId !== ':pageId' ? `/${pageId}` : ''}`;
    navigate(newPath, { replace: true });
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
      // Check if user has access to this organization
      const { count, error: accessError } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', effectiveOrgId)
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
      const { pageData, error, showTemplatePrompt: showTemplate } = await loadPageData(actualPageId, effectiveOrgId);
      
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
    setPageLoadError("You must be logged in to access the page builder");
  }, []);
  
  // Add a timeout to prevent infinite loading states
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn("PageBuilder: Loading timeout reached, forcing load completion");
        setIsLoading(false);
        setPageLoadError("Loading timed out. Please try again or check your connection.");
        toast("Loading timeout reached. Please try again.");
      }
    }, 10000); // 10 second timeout (reduced from 15s)
    
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
