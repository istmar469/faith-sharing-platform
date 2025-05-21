
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from 'lucide-react';

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

  useEffect(() => {
    const detectSubdomain = async () => {
      try {
        // Get the hostname (e.g., church.church-os.com or localhost:3000)
        const hostname = window.location.hostname;
        
        // Skip subdomain logic for localhost during development
        if (hostname === 'localhost') {
          setLoading(false);
          return;
        }
        
        // Extract subdomain from hostname
        // This handles both development and production environments
        const parts = hostname.split('.');
        let subdomain: string | null = null;
        
        // Handle both test.church-os.com and custom top-level domains
        if (parts.length >= 2) {
          subdomain = parts[0];
          
          // Don't treat "www" as a subdomain
          if (subdomain === 'www') {
            subdomain = null;
          }
        }
        
        if (!subdomain) {
          setLoading(false);
          return;
        }
        
        // Look up organization by subdomain
        const { data, error } = await supabase
          .from('organizations')
          .select('id')
          .eq('subdomain', subdomain)
          .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no record is found
          
        if (error) {
          console.error("Error fetching organization by subdomain:", error);
          setError("Could not find organization for this subdomain");
        } else if (data) {
          setOrganizationId(data.id);
        }
      } catch (err) {
        console.error("Error in subdomain detection:", err);
        setError("An error occurred during subdomain routing");
      } finally {
        setLoading(false);
      }
    };
    
    detectSubdomain();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Organization Not Found</h1>
        <p className="text-gray-600">{error}</p>
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
