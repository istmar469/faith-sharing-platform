
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
 * CRITICAL FIX: Prioritize enabled websites and handle multiple organizations with same subdomain
 */
export const lookupOrganizationByDomain = async (
  detectedSubdomain: string, 
  hostname: string, 
  attempt: number = 1,
  setContextError: (error: string | null) => void,
  setIsContextReady: (ready: boolean) => void
): Promise<OrganizationData | null> => {
  const maxAttempts = 3;
  console.log(`🔍 lookupOrganizationByDomain: Looking up organization (attempt ${attempt}/${maxAttempts})`, { detectedSubdomain, hostname });
  
  try {
    if (attempt > 1) {
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }

    // Extract just the subdomain part (e.g., 'test3' from 'test3.church-os.com')
    const pureSubdomain = detectedSubdomain.split('.')[0];
    console.log(`🎯 lookupOrganizationByDomain: Pure subdomain: "${pureSubdomain}"`);

    // CRITICAL FIX: First try to find by exact subdomain match WITH website_enabled = true
    console.log(`📊 lookupOrganizationByDomain: Querying Supabase for ENABLED subdomain: "${pureSubdomain}"`);
    
    let { data: orgData, error } = await supabase
      .from('organizations')
      .select('id, name, website_enabled, subdomain')
      .eq('subdomain', pureSubdomain)
      .eq('website_enabled', true)
      .order('created_at', { ascending: false })
      .maybeSingle();

    console.log(`📋 lookupOrganizationByDomain: Enabled subdomain lookup result (attempt ${attempt}):`, { 
      querySubdomain: pureSubdomain,
      orgData, 
      error,
      errorMessage: error?.message,
      errorCode: error?.code
    });

    // If not found by enabled subdomain, try by custom domain (also enabled)
    if (!orgData && !error) {
      console.log(`🌐 lookupOrganizationByDomain: Trying ENABLED custom domain lookup for: "${hostname}"`);
      ({ data: orgData, error } = await supabase
        .from('organizations')
        .select('id, name, website_enabled, subdomain, custom_domain')
        .eq('custom_domain', hostname)
        .eq('website_enabled', true)
        .order('created_at', { ascending: false })
        .maybeSingle());
      
      console.log(`📋 lookupOrganizationByDomain: Enabled custom domain lookup result:`, { 
        queryHostname: hostname,
        orgData, 
        error,
        errorMessage: error?.message,
        errorCode: error?.code
      });
    }

    // If still not found, check if there are ANY organizations with this subdomain (including disabled)
    if (!orgData && !error) {
      console.log(`🔍 lookupOrganizationByDomain: Checking for ANY organizations with subdomain: "${pureSubdomain}"`);
      const { data: allOrgsData, error: allOrgsError } = await supabase
        .from('organizations')
        .select('id, name, website_enabled, subdomain')
        .eq('subdomain', pureSubdomain)
        .order('website_enabled', { ascending: false }); // Put enabled ones first

      console.log(`📋 lookupOrganizationByDomain: All organizations check:`, { 
        allOrgsData, 
        allOrgsError,
        count: allOrgsData?.length || 0
      });

      if (allOrgsData && allOrgsData.length > 0) {
        const enabledOrg = allOrgsData.find(org => org.website_enabled === true);
        const disabledOrg = allOrgsData.find(org => org.website_enabled === false);
        
        if (enabledOrg) {
          orgData = enabledOrg;
          console.log(`✅ lookupOrganizationByDomain: Found enabled organization:`, enabledOrg);
        } else if (disabledOrg) {
          console.warn(`⚠️ lookupOrganizationByDomain: Found disabled organization:`, disabledOrg);
          setContextError(`${disabledOrg.name}'s website is currently disabled. Please contact the organization administrator.`);
          setIsContextReady(true);
          return null;
        }
      }
    }

    if (error) {
      console.error(`❌ lookupOrganizationByDomain: Database error during organization lookup (attempt ${attempt}):`, {
        error,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      if (attempt < maxAttempts) {
        console.log(`🔄 lookupOrganizationByDomain: Retrying lookup (${attempt + 1}/${maxAttempts})`);
        return await lookupOrganizationByDomain(detectedSubdomain, hostname, attempt + 1, setContextError, setIsContextReady);
      }
      
      setContextError(`Database error looking up subdomain "${detectedSubdomain}": ${error.message}`);
      setIsContextReady(true);
      return null;
    }

    if (orgData) {
      console.log(`✅ lookupOrganizationByDomain: Found organization:`, orgData);
      
      // Double-check that the organization is enabled (should be guaranteed by our query)
      if (orgData.website_enabled === false) {
        console.warn(`⚠️ lookupOrganizationByDomain: Organization found but website disabled:`, orgData.name);
        setContextError(`${orgData.name}'s website is currently disabled. Please contact the organization administrator.`);
        setIsContextReady(true);
        return null;
      }

      return orgData;
    } else {
      // Organization not found - provide clear error message without redirect
      console.warn(`🚫 lookupOrganizationByDomain: No enabled organization found for subdomain/domain`, { 
        detectedSubdomain, 
        hostname, 
        pureSubdomain,
        searchedSubdomain: pureSubdomain,
        searchedCustomDomain: hostname
      });
      
      setContextError(`The subdomain "${pureSubdomain}" is not registered or is not enabled. Please check the URL or contact the organization administrator.`);
      setIsContextReady(true);
      return null;
    }
  } catch (error) {
    console.error(`💥 lookupOrganizationByDomain: Unexpected error during organization lookup (attempt ${attempt}):`, error);
    
    if (attempt < maxAttempts) {
      console.log(`🔄 lookupOrganizationByDomain: Retrying lookup due to unexpected error (${attempt + 1}/${maxAttempts})`);
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
