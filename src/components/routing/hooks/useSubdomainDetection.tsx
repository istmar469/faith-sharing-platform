
import { useState, useEffect, useMemo, useRef } from 'react';
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
  const hasProcessedRef = useRef(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const { setTenantContext } = useTenantContext();
  
  const { subdomain, hostname, hasInitialized } = useSubdomainExtraction();
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
    // Wait for subdomain extraction to complete
    if (!hasInitialized) return;
    
    // Only process once
    if (hasProcessedRef.current) {
      setLoading(false);
      return;
    }
    
    const detectSubdomain = async () => {
      try {
        hasProcessedRef.current = true;
        
        // If subdomain detected, let SubdomainMiddleware handle it
        if (subdomain) {
          setLoading(false);
          return;
        }
        
        // Handle organization ID from URL path
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
        
        // Skip subdomain detection for certain routes
        if (shouldSkipSubdomainDetection(memoizedPathname)) {
          setLoading(false);
          return;
        }
        
        // Handle main domain redirect for authenticated users
        if (isMainDomain(hostname) && memoizedPathname === '/') {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session) {
            navigate('/dashboard');
          }
        }
        
        setLoading(false);
        
      } catch (err) {
        console.error('Subdomain detection error:', err);
        setLoading(false);
      }
    };
    
    detectSubdomain();
  }, [hasInitialized, subdomain, memoizedPathname, hostname, shouldHandleOrgFromPath, shouldSkipSubdomainDetection, setTenantContext, navigate]);
  
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
      console.error('Organization status check error:', err);
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
