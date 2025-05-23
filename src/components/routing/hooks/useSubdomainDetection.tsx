
import { useState, useEffect, useMemo } from 'react';
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
  
  const { subdomain, hostname } = useSubdomainExtraction();
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
  
  const memoizedPathname = useMemo(() => location.pathname, [location.pathname]);
  
  useEffect(() => {
    const detectSubdomain = async () => {
      try {
        if (subdomain) {
          setLoading(false);
          return;
        }
        
        const orgIdFromPath = shouldHandleOrgFromPath(memoizedPathname);
        if (orgIdFromPath) {
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
        
        if (shouldSkipSubdomainDetection(memoizedPathname)) {
          setLoading(false);
          return;
        }
        
        if (isMainDomain(hostname) && memoizedPathname === '/') {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session) {
            navigate('/dashboard');
          }
        }
        
        setLoading(false);
        
      } catch (err) {
        setLoading(false);
      }
    };
    
    detectSubdomain();
  }, [memoizedPathname, subdomain, hostname, shouldHandleOrgFromPath, shouldSkipSubdomainDetection, setTenantContext, navigate]);
  
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
      // Silent error handling
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
