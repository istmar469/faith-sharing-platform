import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertTriangle } from 'lucide-react';
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
import { Button } from "@/components/ui/button";
import LoginDialog from '../auth/LoginDialog';

/**
 * Component that handles subdomain-based routing
 * When a user visits a subdomain, this component:
 * 1. Detects the subdomain from the hostname
 * 2. Looks up the organization by subdomain
 * 3. Routes to the appropriate view
 */
const SubdomainRouter = () => {
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [orgData, setOrgData] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const { viewMode, setViewMode } = useViewMode();
  const { setTenantContext } = useTenantContext();
  
  useEffect(() => {
    console.log("SubdomainRouter initialized - current pathname:", location.pathname);
    const detectSubdomain = async () => {
      try {
        // Check for explicit tenant dashboard route first
        const orgIdFromPath = getOrganizationIdFromPath(location.pathname);
        if (orgIdFromPath) {
          console.log("Organization ID found in path, skipping subdomain logic:", orgIdFromPath);
          setLoading(false);
          return;
        }
        
        // Skip subdomain logic for specific routes
        const skipSubdomainRoutes = [
          '/tenant-dashboard/',
          '/preview-domain/',
          '/page-builder/',
          '/settings/',
          '/super-admin',
          '/login',
          '/signup',
          '/auth',
          '/dashboard',
          '/templates',
          '/diagnostic' // Added diagnostic to the skip list
        ];
        
        // Check if current path starts with any of the skip routes
        const shouldSkipSubdomainDetection = skipSubdomainRoutes.some(route => 
          location.pathname.startsWith(route)
        );
        
        if (shouldSkipSubdomainDetection) {
          console.log("Skipping subdomain detection for special route:", location.pathname);
          setLoading(false);
          return;
        }
        
        // Get the hostname (e.g., church.church-os.com or localhost:3000)
        const hostname = window.location.hostname;
        
        // Log the full URL and hostname for debugging
        console.log("Full URL:", window.location.href);
        console.log("Hostname detected:", hostname);
        
        // Skip subdomain logic for development environments
        const isDevEnv = isDevelopmentEnvironment();
        console.log("Is development environment:", isDevEnv);
        
        if (isDevEnv) {
          console.log("Development environment detected, skipping subdomain routing");
          setLoading(false);
          return;
        }
        
        // Check if this is one of our main domains
        if (isMainDomain(hostname)) {
          console.log("Main domain detected, skipping subdomain routing");
          setLoading(false);
          return;
        }
        
        // Extract subdomain using our helper function that handles various formats
        const subdomain = extractSubdomain(hostname);
        console.log("Extracted subdomain:", subdomain);
        
        if (!subdomain) {
          console.log("No subdomain detected");
          setLoading(false);
          return;
        }
        
        console.log("Processing subdomain:", subdomain);
        
        // Create debug info object
        const debugData: any = {
          hostname,
          subdomain,
          timestamp: new Date().toISOString(),
          isDevEnv
        };
        
        // Handle special preview subdomains
        const previewMatch = subdomain.match(/^id-preview--(.+)$/i);
        if (previewMatch) {
          const previewId = previewMatch[1];
          console.log("Preview subdomain detected, redirecting to preview:", previewId);
          navigate(`/preview-domain/${previewId}`);
          setLoading(false);
          return;
        }
        
        // If the subdomain looks like a UUID
        if (isUuid(subdomain)) {
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
            setLoading(false);
            return;
          }
          
          if (!count || count === 0) {
            console.error("Organization ID not found:", subdomain);
            setError(`No organization exists with ID: ${subdomain}`);
            setErrorDetails("This UUID is not registered to any organization");
            setDebugInfo(debugData);
            setLoading(false);
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
            setLoading(false);
            return;
          }
          
          // Check if user is a super admin to enforce regular admin mode
          const { data: isSuperAdminData } = await supabase.rpc('direct_super_admin_check');
          if (isSuperAdminData) {
            // If we're accessing via subdomain, set to regular_admin mode
            console.log("Super admin accessing via subdomain, setting regular_admin mode");
            setViewMode('regular_admin');
          }
          
          // Get organization name
          const { data: orgData } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', subdomain)
            .single();
            
          // Set tenant context for the application to use
          setTenantContext(subdomain, orgData?.name || null, true);
          
          // If found as an organization ID, redirect to tenant dashboard
          console.log("UUID found as organization ID, redirecting to tenant dashboard");
          navigate(`/tenant-dashboard/${subdomain}`, { replace: true });
          setLoading(false);
          return;
        }
        
        // Look up organization by subdomain (standard case)
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
          
          // Set tenant context for the application to use
          setTenantContext(data.id, data.name, true);
          
          // Check if user is a super admin to enforce regular admin mode
          const { data: isSuperAdminData } = await supabase.rpc('direct_super_admin_check');
          if (isSuperAdminData) {
            // If we're accessing via subdomain, set to regular_admin mode
            console.log("Super admin accessing via subdomain, setting regular_admin mode");
            setViewMode('regular_admin');
          }
          
          // Check if website is enabled for this organization
          if (data.website_enabled === false) {
            setError(`${data.name}'s website is currently disabled`);
            setErrorDetails("The organization administrator has disabled the website");
            console.log("Website is disabled for this organization");
          } else {
            console.log("Setting organization ID for routing:", data.id);
            setOrganizationId(data.id);
            
            // Check if user is authenticated
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session && location.pathname !== '/') {
              console.log("No user session found, showing login dialog for non-homepage");
              setLoginDialogOpen(true);
            }
          }
        } else {
          console.log("No organization found for subdomain:", subdomain);
          setError("No organization found for this subdomain");
          setErrorDetails(`The subdomain '${subdomain}' is not registered in our system`);
          
          // Navigate to diagnostic page if no organization found
          navigate('/diagnostic');
        }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (loginDialogOpen) {
    return (
      <>
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="text-center max-w-md p-6">
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="mb-4 text-gray-600">
              Please log in to access {orgData?.name || 'this site'}.
            </p>
          </div>
        </div>
        <LoginDialog 
          isOpen={loginDialogOpen} 
          setIsOpen={(open) => {
            setLoginDialogOpen(open);
            if (!open) {
              // If dialog closes, reload to check auth again
              window.location.reload();
            }
          }} 
        />
      </>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h1 className="text-xl sm:text-2xl font-bold mb-4">{error}</h1>
        {errorDetails && <p className="text-gray-600 mb-6">{errorDetails}</p>}
        
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <Button 
            className="w-full sm:w-auto"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
          
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => navigate('/diagnostic')}
          >
            Diagnostics
          </Button>
          
          <Button
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={() => setDebugInfo(prev => ({ ...prev, show: !prev?.show }))}
          >
            {debugInfo?.show ? "Hide Debug" : "Show Debug"}
          </Button>
        </div>
        
        {debugInfo?.show && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md text-left text-xs font-mono overflow-auto w-full max-w-md max-h-64">
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }
  
  // If we found an organization ID from the subdomain, redirect to tenant dashboard
  if (organizationId) {
    console.log("Redirecting to tenant dashboard for organization:", organizationId);
    return <Navigate to={`/tenant-dashboard/${organizationId}`} replace />;
  }
  
  // If no subdomain or no matching organization, continue with normal routing
  console.log("No subdomain routing applied, continuing with normal routing");
  return null;
};

export default SubdomainRouter;
