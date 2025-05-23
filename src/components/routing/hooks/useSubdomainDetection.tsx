
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTenantContext } from "@/components/context/TenantContext";
import { isMainDomain, getOrganizationIdFromPath } from "@/utils/domainUtils";
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
    shouldHandleOrgFromPath 
  } = useRouteSkipping();
  
  useEffect(() => {
    console.log("SubdomainRouter: MINIMAL detection - current pathname:", location.pathname);
    const detectSubdomain = async () => {
      try {
        // Skip if SubdomainMiddleware should handle this
        if (subdomain) {
          console.log("SubdomainRouter: Subdomain detected, letting SubdomainMiddleware handle context");
          setLoading(false);
          return;
        }
        
        // Handle explicit tenant dashboard route for main domain
        const orgIdFromPath = shouldHandleOrgFromPath(location.pathname);
        if (orgIdFromPath) {
          console.log("SubdomainRouter: Main domain org path detected:", orgIdFromPath);
          
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
          console.log("SubdomainRouter: Skipping detection for route:", location.pathname);
          setLoading(false);
          return;
        }
        
        // For main domain with no org context, handle auth redirect
        if (isMainDomain(hostname) && location.pathname === '/') {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session) {
            console.log("SubdomainRouter: Authenticated user on main domain, redirecting to dashboard");
            navigate('/dashboard');
          }
        }
        
        setLoading(false);
        
      } catch (err) {
        console.error("SubdomainRouter: Error in minimal detection:", err);
        setLoading(false);
      }
    };
    
    detectSubdomain();
  }, [location.pathname, subdomain, hostname]); // Simplified dependencies
  
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
