
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useViewMode } from "@/components/context/ViewModeContext";
import { useTenantContext } from "@/components/context/TenantContext";
import { 
  isUuid, 
  isDevelopmentEnvironment, 
  getOrganizationIdFromPath, 
  extractSubdomain, 
  isMainDomain 
} from "@/utils/domainUtils";

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
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [orgData, setOrgData] = useState<any>(null);
  const [subdomain, setSubdomain] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const { setViewMode } = useViewMode();
  const { setTenantContext } = useTenantContext();
  
  useEffect(() => {
    console.log("SubdomainRouter initialized - current pathname:", location.pathname);
    const detectSubdomain = async () => {
      try {
        // Check for explicit tenant dashboard route first
        const orgIdFromPath = getOrganizationIdFromPath(location.pathname);
        if (orgIdFromPath) {
          console.log("Organization ID found in path:", orgIdFromPath);
          
          // Set organization context from path
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
        
        // Get the hostname and prepare debug info
        const hostname = window.location.hostname;
        console.log("Full URL:", window.location.href);
        console.log("Hostname detected:", hostname);
        
        // Skip for development environment if not using subdomain format
        const isDevEnv = isDevelopmentEnvironment();
        console.log("Is development environment:", isDevEnv);
        
        // Extract subdomain
        const extractedSubdomain = extractSubdomain(hostname);
        setSubdomain(extractedSubdomain);
        console.log("Extracted subdomain:", extractedSubdomain);
        
        // If no subdomain and not on main domain, continue without subdomain routing
        if (!extractedSubdomain) {
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
        
        console.log("Processing subdomain:", extractedSubdomain);
        
        // Create debug info object
        const debugData: any = {
          hostname,
          subdomain: extractedSubdomain,
          timestamp: new Date().toISOString(),
          isDevEnv
        };
        
        // Handle special preview subdomains
        const previewMatch = extractedSubdomain.match(/^id-preview--(.+)$/i);
        if (previewMatch) {
          const previewId = previewMatch[1];
          console.log("Preview subdomain detected, redirecting to preview:", previewId);
          navigate(`/preview-domain/${previewId}`);
          setLoading(false);
          return;
        }
        
        // Process the subdomain based on its format
        await processSubdomain(extractedSubdomain, debugData);
        
      } catch (err) {
        console.error("Error in subdomain detection:", err);
        setError("An error occurred during subdomain routing");
        setErrorDetails("Please try again later or contact support");
      } finally {
        setLoading(false);
      }
    };
    
    detectSubdomain();
  }, [toast, location.pathname, navigate, setViewMode, setTenantContext]);
  
  // Extract method for processing the subdomain
  const processSubdomain = async (subdomain: string, debugData: any) => {
    // If the subdomain looks like a UUID
    if (isUuid(subdomain)) {
      await handleUuidSubdomain(subdomain, debugData);
      return;
    }
    
    // Look up organization by subdomain (standard case)
    await handleStandardSubdomain(subdomain, debugData);
  };
  
  // Handle UUID-format subdomains
  const handleUuidSubdomain = async (subdomain: string, debugData: any) => {
    console.log("Subdomain appears to be a UUID, treating as organization ID");
    
    // Check if the organization exists first
    const { count, error: countError } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
      .eq('id', subdomain);
      
    debugData.orgCheck = { count, error: countError };
    
    if (countError) {
      console.error("Error checking if organization exists:", countError);
      setError("Database error while checking organization");
      setErrorDetails(`Error: ${countError.message}`);
      setDebugInfo(debugData);
      return;
    }
    
    if (!count || count === 0) {
      console.error("Organization ID not found:", subdomain);
      setError(`No organization exists with ID: ${subdomain}`);
      setErrorDetails("This UUID is not registered to any organization");
      setDebugInfo(debugData);
      toast({
        title: "Organization Not Found",
        description: `The organization with ID ${subdomain} does not exist`,
        variant: "destructive"
      });
      return;
    }
    
    // Get current user session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.log("No user session found, showing login dialog");
      setLoginDialogOpen(true);
      setOrgData({ id: subdomain });
      return;
    }
    
    // Handle user access without auto-redirecting
    await handleUserAccess(subdomain);
  };
  
  // Handle standard subdomain format
  const handleStandardSubdomain = async (subdomain: string, debugData: any) => {
    console.log("Looking up organization by subdomain:", subdomain);
    const { data, error } = await supabase
      .from('organizations')
      .select('id, name, website_enabled')
      .eq('subdomain', subdomain)
      .maybeSingle();
      
    debugData.orgLookup = { data, error };
    setDebugInfo(debugData);
    console.log("Organization lookup result:", data, error);
      
    if (error) {
      console.error("Error fetching organization by subdomain:", error);
      setError("Could not find organization for this subdomain");
      setErrorDetails(`Database error: ${error.message}`);
    } else if (data) {
      console.log("Found organization for subdomain:", data.id, "Website enabled:", data.website_enabled);
      setOrgData(data);
      
      // Set tenant context for subdomain access
      setTenantContext(data.id, data.name, true);
      setOrganizationId(data.id);
      
      // Check if website is enabled
      if (data.website_enabled === false) {
        setError(`${data.name}'s website is currently disabled`);
        setErrorDetails("The organization administrator has disabled the website");
        console.log("Website is disabled for this organization");
      } else {
        // Check if user is authenticated for non-homepage paths that require auth
        const { data: sessionData } = await supabase.auth.getSession();
        const isAuthRequiredPath = isAuthenticationRequiredPath(location.pathname);
        
        if (!sessionData.session && isAuthRequiredPath) {
          console.log("No user session found, showing login dialog for protected path");
          setLoginDialogOpen(true);
        } 
        // Stay on subdomain - no auto redirects that break context
        else if (sessionData.session && (location.pathname === '/' || location.pathname === '')) {
          console.log("User authenticated at root path on subdomain, staying in subdomain context");
          // Don't redirect - let the normal routing handle this
        }
      }
    } else {
      console.log("No organization found for subdomain:", subdomain);
      setError("No organization found for this subdomain");
      setErrorDetails(`The subdomain '${subdomain}' is not registered in our system`);
      
      // Navigate to diagnostic page
      navigate('/diagnostic');
    }
  };
  
  // Handle user access and roles - simplified to avoid context escaping
  const handleUserAccess = async (organizationId: string) => {
    // Check if user is a super admin to enforce regular admin mode
    const { data: isSuperAdminData } = await supabase.rpc('direct_super_admin_check');
    if (isSuperAdminData) {
      // If accessing via subdomain, set to regular_admin mode
      console.log("Super admin accessing via subdomain, setting regular_admin mode");
      setViewMode('regular_admin');
    }
    
    // Get organization name for tenant context
    const { data: orgData } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single();
      
    // Set tenant context for the application to use
    setTenantContext(organizationId, orgData?.name || null, true);
    
    // Don't auto-redirect on subdomain - let normal routing handle navigation
    console.log("User access configured for subdomain, staying in context");
  };
  
  // Check if a path requires authentication
  const isAuthenticationRequiredPath = (pathname: string): boolean => {
    const authRequiredPaths = [
      '/tenant-dashboard/',
      '/settings/',
      '/admin/',
      '/page-builder/'
    ];
    
    return authRequiredPaths.some(path => pathname.startsWith(path));
  };
  
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
      
      // Navigate to the diagnostic page
      navigate('/diagnostic');
    } catch (err) {
      console.error("Error checking organizations:", err);
    }
  };
  
  return {
    loading,
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

// Helper function to determine if we should skip subdomain detection for this route
const shouldSkipSubdomainDetection = (pathname: string): boolean => {
  const skipSubdomainRoutes = [
    '/preview-domain/',
    '/login',
    '/signup',
    '/auth',
    '/diagnostic'
  ];
  
  // Don't skip tenant-specific routes
  if (pathname.startsWith('/tenant-dashboard/') ||
      pathname.startsWith('/page-builder') ||
      pathname.startsWith('/settings/')) {
    return false;
  }
  
  return skipSubdomainRoutes.some(route => pathname.startsWith(route));
};
