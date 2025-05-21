
import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

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
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();

  // Helper function to check if a string is a UUID
  const isUUID = (str: string): boolean => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
  };

  useEffect(() => {
    const detectSubdomain = async () => {
      try {
        // Skip subdomain logic if we're already on a tenant dashboard route
        // This prevents conflicts between subdomain routing and direct URL access
        if (location.pathname.startsWith('/tenant-dashboard/') ||
            location.pathname.startsWith('/preview-domain/')) {
          setLoading(false);
          return;
        }
        
        // Get the hostname (e.g., church.church-os.com or localhost:3000)
        const hostname = window.location.hostname;
        
        // Skip subdomain logic for localhost during development
        if (hostname === 'localhost' || hostname === 'lovable.dev' || hostname.endsWith('lovable.app')) {
          console.log("Development environment detected, skipping subdomain routing");
          setLoading(false);
          return;
        }
        
        // Extract subdomain from hostname
        // This handles both development and production environments
        const parts = hostname.split('.');
        let subdomain: string | null = null;
        
        // Handle both test.church-os.com and custom top-level domains
        if (parts.length >= 2) {
          // Don't treat the main domain as a subdomain
          if (hostname === 'church-os.com' || 
              hostname.endsWith('.church-os.com') && parts[0] === 'www') {
            setLoading(false);
            return;
          }
          
          subdomain = parts[0];
          
          // Don't treat "www" or IP-like strings as a subdomain
          if (subdomain === 'www' || /^\d+$/.test(subdomain)) {
            subdomain = null;
          }
        }
        
        if (!subdomain) {
          setLoading(false);
          return;
        }
        
        console.log("Detected subdomain:", subdomain);
        
        // Handle special preview subdomains (id-preview--UUID format)
        const previewMatch = subdomain.match(/^id-preview--(.+)$/i);
        if (previewMatch) {
          const previewId = previewMatch[1];
          console.log("Preview subdomain detected, redirecting to preview:", previewId);
          navigate(`/preview-domain/${previewId}`);
          setLoading(false);
          return;
        }
        
        // If the subdomain looks like a UUID, try to handle it as an organization ID directly
        if (isUUID(subdomain)) {
          console.log("Subdomain appears to be a UUID, treating as organization ID");
          const { data, error } = await supabase
            .from('organizations')
            .select('id, name, website_enabled')
            .eq('id', subdomain)
            .maybeSingle();
            
          if (data) {
            // If found as an organization ID, redirect to preview
            navigate(`/preview-domain/${subdomain}`);
            setLoading(false);
            return;
          }
          // If not found, continue to look it up as a subdomain (fallthrough)
        }
        
        // Look up organization by subdomain (standard case)
        const { data, error } = await supabase
          .from('organizations')
          .select('id, name, website_enabled')
          .eq('subdomain', subdomain)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching organization by subdomain:", error);
          setError("Could not find organization for this subdomain");
          setErrorDetails(`Database error: ${error.message}`);
          toast({
            title: "Subdomain Error",
            description: `Could not find organization for subdomain: ${subdomain}`,
            variant: "destructive"
          });
        } else if (data) {
          console.log("Found organization for subdomain:", data.id);
          
          // Check if website is enabled for this organization
          if (data.website_enabled === false) {
            setError(`${data.name}'s website is currently disabled`);
            setErrorDetails("The organization administrator has disabled the website");
          } else {
            setOrganizationId(data.id);
          }
        } else {
          console.log("No organization found for subdomain:", subdomain);
          setError("No organization found for this subdomain");
          setErrorDetails(`The subdomain '${subdomain}' is not registered in our system`);
          toast({
            title: "Subdomain Error",
            description: `No organization exists with subdomain: ${subdomain}`,
            variant: "destructive"
          });
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
  }, [toast, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h1 className="text-xl sm:text-2xl font-bold mb-4">{error}</h1>
        {errorDetails && <p className="text-gray-600 mb-6">{errorDetails}</p>}
        <button 
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 w-full sm:w-auto"
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }
  
  // If we found an organization ID from the subdomain, redirect to tenant dashboard
  if (organizationId) {
    return <Navigate to={`/tenant-dashboard/${organizationId}`} replace />;
  }
  
  // If no subdomain or no matching organization, continue with normal routing
  return null;
};

export default SubdomainRouter;
