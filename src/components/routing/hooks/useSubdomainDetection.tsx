
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTenantContext } from "@/components/context/TenantContext";
import { isMainDomain } from "@/utils/domainUtils";
import { useSubdomainExtraction } from "@/hooks/useSubdomainExtraction";
import { useOrganizationLookup } from "@/hooks/useOrganizationLookup";
import { useAuthenticationCheck } from "@/hooks/useAuthenticationCheck";
import { useRouteSkipping } from "@/hooks/useRouteSkipping";

interface SubdomainDetectionResult {
  loading: boolean;
  error: string | null;
  errorDetails: string | null;
  debugInfo: any;
  organizationId: string | null;
  loginDialogOpen: boolean;
  setLoginDialogOpen: (open: boolean) => void;
  orgData: any;
  checkOrganizationStatus: () => Promise<void>;
  subdomain: string | null;
}

export const useSubdomainDetection = (): SubdomainDetectionResult => {
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const { setTenantContext } = useTenantContext();
  
  const { subdomain, isDevEnv, hostname } = useSubdomainExtraction();
  const { 
    loading: orgLoading, 
    error, 
    errorDetails, 
    orgData, 
    lookupOrganization 
  } = useOrganizationLookup();
  const { 
    loginDialogOpen, 
    setLoginDialogOpen, 
    checkAuthentication 
  } = useAuthenticationCheck();
  const { 
    shouldSkipSubdomainDetection, 
    shouldHandleOrgFromPath, 
    shouldHandlePreviewSubdomain 
  } = useRouteSkipping();
  
  useEffect(() => {
    console.log("SubdomainRouter initialized - current pathname:", location.pathname);
    const detectSubdomain = async () => {
      try {
        // Check for explicit tenant dashboard route first
        const orgIdFromPath = shouldHandleOrgFromPath(location.pathname);
        if (orgIdFromPath) {
          console.log("Organization ID found in path:", orgIdFromPath);
          
          const { data: orgData } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', orgIdFromPath)
            .single();
            
          if (orgData) {
            setTenantContext(orgIdFromPath, orgData.name, false);
            setOrganizationId(orgIdFromPath);
          }
          
          setLoading(false);
          return;
        }
        
        // Handle skip routes
        if (shouldSkipSubdomainDetection(location.pathname)) {
          console.log("Skipping subdomain detection for special route:", location.pathname);
          setLoading(false);
          return;
        }
        
        // Create debug info object
        const debugData: any = {
          hostname,
          subdomain,
          timestamp: new Date().toISOString(),
          isDevEnv
        };
        setDebugInfo(debugData);
        
        console.log("Full URL:", window.location.href);
        console.log("Hostname detected:", hostname);
        console.log("Is development environment:", isDevEnv);
        console.log("Extracted subdomain:", subdomain);
        
        // If no subdomain and not on main domain, continue without subdomain routing
        if (!subdomain) {
          console.log("No subdomain detected");
          
          // For main domain with no org context, redirect to dashboard only if authenticated
          if (isMainDomain(hostname) && location.pathname === '/') {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData.session) {
              console.log("User is authenticated on main domain root, redirecting to dashboard");
              navigate('/dashboard');
            }
          }
          
          setLoading(false);
          return;
        }
        
        console.log("Processing subdomain:", subdomain);
        
        // Handle special preview subdomains
        const previewMatch = shouldHandlePreviewSubdomain(subdomain);
        if (previewMatch) {
          const previewId = previewMatch[1];
          console.log("Preview subdomain detected, redirecting to preview:", previewId);
          navigate(`/preview-domain/${previewId}`);
          setLoading(false);
          return;
        }
        
        // Look up organization
        await lookupOrganization(subdomain);
        
      } catch (err) {
        console.error("Error in subdomain detection:", err);
      } finally {
        setLoading(false);
      }
    };
    
    detectSubdomain();
  }, [toast, location.pathname, navigate, setTenantContext, subdomain, hostname, isDevEnv]);
  
  // Handle organization data updates
  useEffect(() => {
    if (orgData && !error) {
      console.log("Setting tenant context for organization:", orgData);
      setTenantContext(orgData.id, orgData.name, true);
      setOrganizationId(orgData.id);
      
      // Check authentication for the current path
      checkAuthentication(location.pathname, orgData);
    }
  }, [orgData, error, setTenantContext, checkAuthentication, location.pathname]);
  
  // Handle navigation for invalid subdomains
  useEffect(() => {
    if (error && !orgData && subdomain) {
      console.log("Invalid subdomain, navigating to diagnostic");
      navigate('/diagnostic');
    }
  }, [error, orgData, subdomain, navigate]);
  
  // Check if the organization exists in the database
  const checkOrganizationStatus = async () => {
    if (!organizationId) return;
    
    try {
      const { count } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true });
        
      toast({
        title: "Database Check", 
        description: `There are ${count || 0} total organizations in the database`,
      });
      
      navigate('/diagnostic');
    } catch (err) {
      console.error("Error checking organizations:", err);
    }
  };
  
  return {
    loading: loading || orgLoading,
    error,
    errorDetails,
    debugInfo,
    organizationId,
    loginDialogOpen,
    setLoginDialogOpen,
    orgData,
    checkOrganizationStatus,
    subdomain
  };
};
