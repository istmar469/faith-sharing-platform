
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { isUuid } from "@/utils/domainUtils";

interface OrganizationLookupResult {
  loading: boolean;
  error: string | null;
  errorDetails: string | null;
  orgData: any;
  lookupOrganization: (subdomain: string) => Promise<void>;
}

export const useOrganizationLookup = (): OrganizationLookupResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [orgData, setOrgData] = useState<any>(null);

  const lookupOrganization = async (subdomain: string) => {
    setLoading(true);
    setError(null);
    setErrorDetails(null);

    try {
      // If the subdomain looks like a UUID
      if (isUuid(subdomain)) {
        await handleUuidSubdomain(subdomain);
      } else {
        await handleStandardSubdomain(subdomain);
      }
    } catch (err) {
      console.error("Error in organization lookup:", err);
      setError("An error occurred during organization lookup");
      setErrorDetails("Please try again later or contact support");
    } finally {
      setLoading(false);
    }
  };

  const handleUuidSubdomain = async (subdomain: string) => {
    console.log("Subdomain appears to be a UUID, treating as organization ID");
    
    const { count, error: countError } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
      .eq('id', subdomain);
      
    if (countError) {
      console.error("Error checking if organization exists:", countError);
      setError("Database error while checking organization");
      setErrorDetails(`Error: ${countError.message}`);
      return;
    }
    
    if (!count || count === 0) {
      console.error("Organization ID not found:", subdomain);
      setError(`No organization exists with ID: ${subdomain}`);
      setErrorDetails("This UUID is not registered to any organization");
      return;
    }

    // Get organization data
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, website_enabled')
      .eq('id', subdomain)
      .single();

    if (orgError || !orgData) {
      setError("Could not fetch organization data");
      setErrorDetails(`Database error: ${orgError?.message}`);
    } else {
      setOrgData(orgData);
    }
  };

  const handleStandardSubdomain = async (subdomain: string) => {
    console.log("Looking up organization by subdomain:", subdomain);
    
    const { data, error } = await supabase
      .from('organizations')
      .select('id, name, website_enabled')
      .eq('subdomain', subdomain)
      .maybeSingle();
      
    console.log("Organization lookup result:", data, error);
      
    if (error) {
      console.error("Error fetching organization by subdomain:", error);
      setError("Could not find organization for this subdomain");
      setErrorDetails(`Database error: ${error.message}`);
    } else if (data) {
      console.log("Found organization for subdomain:", data.id, "Website enabled:", data.website_enabled);
      setOrgData(data);
      
      if (data.website_enabled === false) {
        setError(`${data.name}'s website is currently disabled`);
        setErrorDetails("The organization administrator has disabled the website");
        console.log("Website is disabled for this organization");
      }
    } else {
      console.log("No organization found for subdomain:", subdomain);
      setError("No organization found for this subdomain");
      setErrorDetails(`The subdomain '${subdomain}' is not registered in our system`);
    }
  };

  return {
    loading,
    error,
    errorDetails,
    orgData,
    lookupOrganization
  };
};
