
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  const { pageId } = useParams<{ pageId: string }>();
  const { toast } = useToast();
  const [initialPageData, setInitialPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageLoadError, setPageLoadError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const { organizationId: contextOrgId, subdomain, isSubdomainAccess } = useTenantContext();
  const { organizationId, isLoading: orgIdLoading, setOrganizationId } = useOrganizationId(pageId);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showTemplatePrompt, setShowTemplatePrompt] = useState(false);
  
  console.log("PageBuilder: Context info", {
    contextOrgId,
    organizationId,
    subdomain,
    isSubdomainAccess,
    pageId
  });
  
  // Use organization ID from tenant context if available
  useEffect(() => {
    if (contextOrgId && !organizationId) {
      console.log("PageBuilder: Using organization ID from tenant context:", contextOrgId);
      setOrganizationId(contextOrgId);
    }
  }, [contextOrgId, organizationId, setOrganizationId]);
  
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
      
      // Determine which organization ID to use
      const orgId = organizationId || contextOrgId;
      
      console.log("PageBuilder: Loading page data for organization:", orgId);
      
      if (orgId) {
        const { pageData, error, showTemplatePrompt: showTemplate } = await loadPageData(pageId, orgId);
        
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
        setPageLoadError("Could not determine organization ID");
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
    return <PageLoadError error={pageLoadError} organizationId={organizationId || contextOrgId} />;
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
          organizationId={organizationId || contextOrgId}
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
