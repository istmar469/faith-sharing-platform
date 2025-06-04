
import { supabase } from '@/integrations/supabase/client';

export interface OrganizationData {
  id: string;
  name: string;
  website_enabled: boolean;
  subdomain?: string;
  custom_domain?: string;
}

/**
 * Lookup organization by ID (for Lovable development) with retry logic
 */
export const lookupOrganizationById = async (
  orgId: string, 
  attempt: number = 1,
  setContextError: (error: string | null) => void,
  setIsContextReady: (ready: boolean) => void
): Promise<OrganizationData | null> => {
  const maxAttempts = 3;
  console.log(`lookupOrganizationById: Looking up organization by ID (attempt ${attempt}/${maxAttempts})`, { orgId });
  
  try {
    // Add a small delay for retries to handle transient network issues
    if (attempt > 1) {
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }

    console.log(`lookupOrganizationById: Querying for organization ID: ${orgId}`);
    
    const { data: orgData, error } = await supabase
      .from('organizations')
      .select('id, name, website_enabled, subdomain')
      .eq('id', orgId)
      .maybeSingle();

    console.log(`lookupOrganizationById: Organization lookup result (attempt ${attempt}):`, { orgData, error });

    if (error) {
      console.error(`lookupOrganizationById: Database error during organization lookup (attempt ${attempt}):`, error);
      
      // Retry on database errors
      if (attempt < maxAttempts) {
        console.log(`lookupOrganizationById: Retrying lookup (${attempt + 1}/${maxAttempts})`);
        return await lookupOrganizationById(orgId, attempt + 1, setContextError, setIsContextReady);
      }
      
      setContextError(`Database error looking up organization "${orgId}": ${error.message}`);
      setIsContextReady(true);
      return null;
    }

    if (orgData) {
      console.log("lookupOrganizationById: Found organization", orgData);
      
      // Check if website is enabled
      if (orgData.website_enabled === false) {
        console.warn("lookupOrganizationById: Website disabled for organization:", orgData.name);
        setContextError(`${orgData.name}'s website is currently disabled. Please contact the organization administrator.`);
        setIsContextReady(true);
        return null;
      }

      return orgData;
    } else {
      console.warn("lookupOrganizationById: No organization found for ID", { orgId });
      setContextError(`No organization found with ID: ${orgId}. Please contact support.`);
      setIsContextReady(true);
      return null;
    }
  } catch (error) {
    console.error(`lookupOrganizationById: Unexpected error during organization lookup (attempt ${attempt}):`, error);
    
    // Retry on unexpected errors
    if (attempt < maxAttempts) {
      console.log(`lookupOrganizationById: Retrying lookup due to unexpected error (${attempt + 1}/${maxAttempts})`);
      return await lookupOrganizationById(orgId, attempt + 1, setContextError, setIsContextReady);
    }
    
    setContextError(`Unexpected error during organization validation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    setIsContextReady(true);
    return null;
  }
};

/**
 * Lookup organization by subdomain or custom domain with retry logic
 */
export const lookupOrganizationByDomain = async (
  detectedSubdomain: string, 
  hostname: string, 
  attempt: number = 1,
  setContextError: (error: string | null) => void,
  setIsContextReady: (ready: boolean) => void
): Promise<OrganizationData | null> => {
  const maxAttempts = 3;
  console.log(`lookupOrganizationByDomain: Looking up organization (attempt ${attempt}/${maxAttempts})`, { detectedSubdomain, hostname });
  
  try {
    // Add a small delay for retries to handle transient network issues
    if (attempt > 1) {
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }

    // Extract just the subdomain part (e.g., 'test3' from 'test3.church-os.com')
    const pureSubdomain = detectedSubdomain.split('.')[0];
    console.log(`lookupOrganizationByDomain: Pure subdomain: ${pureSubdomain}`);

    // First try to find by exact subdomain match
    console.log(`lookupOrganizationByDomain: Querying for subdomain: ${detectedSubdomain} or ${pureSubdomain}`);
    
    let { data: orgData, error } = await supabase
      .from('organizations')
      .select('id, name, website_enabled, subdomain')
      .eq('subdomain', pureSubdomain)
      .maybeSingle();

    console.log(`lookupOrganizationByDomain: Subdomain lookup result (attempt ${attempt}):`, { orgData, error });

    // If not found by pure subdomain, try the full detected subdomain
    if (!orgData && !error && detectedSubdomain !== pureSubdomain) {
      console.log("lookupOrganizationByDomain: Trying full detected subdomain:", detectedSubdomain);
      ({ data: orgData, error } = await supabase
        .from('organizations')
        .select('id, name, website_enabled, subdomain')
        .eq('subdomain', detectedSubdomain)
        .maybeSingle());
      
      console.log("lookupOrganizationByDomain: Full subdomain lookup result:", { orgData, error });
    }

    // If not found by subdomain, try by custom domain
    if (!orgData && !error) {
      console.log("lookupOrganizationByDomain: Trying custom domain lookup for:", hostname);
      ({ data: orgData, error } = await supabase
        .from('organizations')
        .select('id, name, website_enabled, subdomain, custom_domain')
        .eq('custom_domain', hostname)
        .maybeSingle());
      
      console.log("lookupOrganizationByDomain: Custom domain lookup result:", { orgData, error });
    }

    if (error) {
      console.error(`lookupOrganizationByDomain: Database error during organization lookup (attempt ${attempt}):`, error);
      
      // Retry on database errors
      if (attempt < maxAttempts) {
        console.log(`lookupOrganizationByDomain: Retrying lookup (${attempt + 1}/${maxAttempts})`);
        return await lookupOrganizationByDomain(detectedSubdomain, hostname, attempt + 1, setContextError, setIsContextReady);
      }
      
      setContextError(`Database error looking up subdomain "${detectedSubdomain}": ${error.message}`);
      setIsContextReady(true);
      return null;
    }

    if (orgData) {
      console.log("lookupOrganizationByDomain: Found organization", orgData);
      
      // Check if website is enabled
      if (orgData.website_enabled === false) {
        console.warn("lookupOrganizationByDomain: Website disabled for organization:", orgData.name);
        setContextError(`${orgData.name}'s website is currently disabled. Please contact the organization administrator.`);
        setIsContextReady(true);
        return null;
      }

      return orgData;
    } else {
      // IMPORTANT: No organization found for this subdomain - redirect to main domain
      console.warn("lookupOrganizationByDomain: No organization found for subdomain/domain", { detectedSubdomain, hostname, pureSubdomain });
      console.log("lookupOrganizationByDomain: Redirecting to main domain to avoid confusion");
      
      // Create redirect URL with notification
      const mainDomain = 'https://church-os.com';
      const redirectUrl = new URL(mainDomain);
      redirectUrl.searchParams.set('subdomain_not_found', detectedSubdomain);
      redirectUrl.searchParams.set('original_url', window.location.href);
      
      console.log("lookupOrganizationByDomain: Redirecting to:", redirectUrl.toString());
      
      // Perform the redirect
      window.location.href = redirectUrl.toString();
      return null; // Don't set context ready since we're redirecting
    }
  } catch (error) {
    console.error(`lookupOrganizationByDomain: Unexpected error during organization lookup (attempt ${attempt}):`, error);
    
    // Retry on unexpected errors
    if (attempt < maxAttempts) {
      console.log(`lookupOrganizationByDomain: Retrying lookup due to unexpected error (${attempt + 1}/${maxAttempts})`);
      return await lookupOrganizationByDomain(detectedSubdomain, hostname, attempt + 1, setContextError, setIsContextReady);
    }
    
    setContextError(`Unexpected error during subdomain validation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    setIsContextReady(true);
    return null;
  }
};

/**
 * Load root domain organization data
 */
export const loadRootDomainOrganization = async (
  rootDomainOrgId: string,
  setContextError: (error: string | null) => void,
  setIsContextReady: (ready: boolean) => void
): Promise<OrganizationData | null> => {
  try {
    console.log("loadRootDomainOrganization: Loading root domain organization:", rootDomainOrgId);
    
    const { data: orgData, error } = await supabase
      .from('organizations')
      .select('id, name, website_enabled, subdomain')
      .eq('id', rootDomainOrgId)
      .maybeSingle();

    if (error) {
      console.error("loadRootDomainOrganization: Error loading root domain organization:", error);
      setContextError(`Error loading root domain organization: ${error.message}`);
      setIsContextReady(true);
      return null;
    }

    if (!orgData) {
      console.error("loadRootDomainOrganization: Root domain organization not found in database");
      setContextError(`Root domain organization not found. Please contact support.`);
      setIsContextReady(true);
      return null;
    }

    console.log("loadRootDomainOrganization: Found root domain organization:", orgData);
    return orgData;
    
  } catch (error) {
    console.error("loadRootDomainOrganization: Unexpected error loading root domain organization:", error);
    setContextError(`Failed to load root domain organization: ${error instanceof Error ? error.message : 'Unknown error'}`);
    setIsContextReady(true);
    return null;
  }
};
