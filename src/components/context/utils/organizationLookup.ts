
import { supabase } from '@/integrations/supabase/client';

export interface OrganizationData {
  id: string;
  name: string;
  website_enabled: boolean;
  subdomain?: string;
  custom_domain?: string;
}

/**
 * Lookup organization by ID (for Lovable development) with enhanced retry logic
 */
export const lookupOrganizationById = async (
  orgId: string, 
  attempt: number = 1,
  setContextError: (error: string | null) => void,
  setIsContextReady: (ready: boolean) => void
): Promise<OrganizationData | null> => {
  const maxAttempts = 3;
  console.log(`🔍 lookupOrganizationById: Looking up organization by ID (attempt ${attempt}/${maxAttempts})`, { orgId });
  
  try {
    if (attempt > 1) {
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }

    console.log(`📊 lookupOrganizationById: Executing database query for ID: ${orgId}`);
    
    const { data: orgData, error } = await supabase
      .from('organizations')
      .select('id, name, website_enabled, subdomain')
      .eq('id', orgId)
      .maybeSingle();

    console.log(`📋 lookupOrganizationById: Database response (attempt ${attempt}):`, {
      orgData,
      error: error ? { message: error.message, code: error.code } : null
    });

    if (error) {
      console.error(`❌ lookupOrganizationById: Database error (attempt ${attempt}):`, error);
      
      if (attempt < maxAttempts) {
        console.log(`🔄 lookupOrganizationById: Retrying lookup (${attempt + 1}/${maxAttempts})`);
        return await lookupOrganizationById(orgId, attempt + 1, setContextError, setIsContextReady);
      }
      
      setContextError(`Database error looking up organization "${orgId}": ${error.message}`);
      setIsContextReady(true);
      return null;
    }

    if (orgData) {
      console.log("✅ lookupOrganizationById: Found organization", orgData);
      
      if (orgData.website_enabled === false) {
        console.warn("⚠️ lookupOrganizationById: Website disabled for organization:", orgData.name);
        setContextError(`${orgData.name}'s website is currently disabled. Please contact the organization administrator.`);
        setIsContextReady(true);
        return null;
      }

      return orgData;
    } else {
      console.warn("❌ lookupOrganizationById: No organization found for ID", { orgId });
      setContextError(`No organization found with ID: ${orgId}. Please contact support.`);
      setIsContextReady(true);
      return null;
    }
  } catch (error) {
    console.error(`💥 lookupOrganizationById: Unexpected error (attempt ${attempt}):`, error);
    
    if (attempt < maxAttempts) {
      console.log(`🔄 lookupOrganizationById: Retrying due to unexpected error (${attempt + 1}/${maxAttempts})`);
      return await lookupOrganizationById(orgId, attempt + 1, setContextError, setIsContextReady);
    }
    
    setContextError(`Unexpected error during organization validation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    setIsContextReady(true);
    return null;
  }
};

/**
 * ENHANCED: Lookup organization by subdomain with priority for enabled organizations
 */
export const lookupOrganizationByDomain = async (
  detectedSubdomain: string, 
  hostname: string, 
  attempt: number = 1,
  setContextError: (error: string | null) => void,
  setIsContextReady: (ready: boolean) => void
): Promise<OrganizationData | null> => {
  const maxAttempts = 3;
  console.log(`🔍 lookupOrganizationByDomain: Enhanced lookup (attempt ${attempt}/${maxAttempts})`, { 
    detectedSubdomain, 
    hostname 
  });
  
  try {
    if (attempt > 1) {
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }

    // Extract just the subdomain part (e.g., 'test3' from 'test3.church-os.com')
    const pureSubdomain = detectedSubdomain.split('.')[0];
    console.log(`🎯 lookupOrganizationByDomain: Pure subdomain extracted: "${pureSubdomain}"`);

    // ENHANCED QUERY: First, get ALL organizations with this subdomain and handle priority
    console.log(`📊 lookupOrganizationByDomain: Querying for ALL organizations with subdomain: "${pureSubdomain}"`);
    
    const { data: allOrgs, error: queryError } = await supabase
      .from('organizations')
      .select('id, name, website_enabled, subdomain')
      .eq('subdomain', pureSubdomain)
      .order('website_enabled', { ascending: false }) // Enabled first
      .order('created_at', { ascending: false }); // Newest first as tiebreaker

    console.log(`📋 lookupOrganizationByDomain: All organizations query result:`, {
      allOrgs,
      count: allOrgs?.length || 0,
      error: queryError ? { message: queryError.message, code: queryError.code } : null
    });

    if (queryError) {
      console.error(`❌ lookupOrganizationByDomain: Database error (attempt ${attempt}):`, queryError);
      
      if (attempt < maxAttempts) {
        console.log(`🔄 lookupOrganizationByDomain: Retrying lookup (${attempt + 1}/${maxAttempts})`);
        return await lookupOrganizationByDomain(detectedSubdomain, hostname, attempt + 1, setContextError, setIsContextReady);
      }
      
      setContextError(`Database error looking up subdomain "${detectedSubdomain}": ${queryError.message}`);
      setIsContextReady(true);
      return null;
    }

    // Process the results with enhanced logic
    if (!allOrgs || allOrgs.length === 0) {
      console.warn(`❌ lookupOrganizationByDomain: No organizations found for subdomain: "${pureSubdomain}"`);
      setContextError(`The subdomain "${pureSubdomain}" is not registered. Please check the URL or contact the organization administrator.`);
      setIsContextReady(true);
      return null;
    }

    console.log(`📋 lookupOrganizationByDomain: Found ${allOrgs.length} organization(s) with subdomain "${pureSubdomain}"`);
    
    // Find the first enabled organization (should be first due to ordering)
    const enabledOrg = allOrgs.find(org => org.website_enabled === true);
    const disabledOrgs = allOrgs.filter(org => org.website_enabled === false);
    
    console.log(`📊 lookupOrganizationByDomain: Analysis:`, {
      enabledOrg: enabledOrg ? { id: enabledOrg.id, name: enabledOrg.name } : null,
      disabledCount: disabledOrgs.length,
      disabledOrgs: disabledOrgs.map(org => ({ id: org.id, name: org.name }))
    });

    if (enabledOrg) {
      console.log(`✅ lookupOrganizationByDomain: Found enabled organization:`, enabledOrg);
      return enabledOrg;
    }

    // If no enabled organization but disabled ones exist
    if (disabledOrgs.length > 0) {
      const firstDisabled = disabledOrgs[0];
      console.warn(`⚠️ lookupOrganizationByDomain: Only disabled organizations found:`, firstDisabled);
      setContextError(`${firstDisabled.name}'s website is currently disabled. Please contact the organization administrator.`);
      setIsContextReady(true);
      return null;
    }

    // This shouldn't happen due to the check above, but just in case
    console.error(`💥 lookupOrganizationByDomain: Unexpected state - organizations found but none processed`);
    setContextError(`Unexpected error processing subdomain "${pureSubdomain}". Please try again.`);
    setIsContextReady(true);
    return null;

  } catch (error) {
    console.error(`💥 lookupOrganizationByDomain: Unexpected error (attempt ${attempt}):`, error);
    
    if (attempt < maxAttempts) {
      console.log(`🔄 lookupOrganizationByDomain: Retrying due to unexpected error (${attempt + 1}/${maxAttempts})`);
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
    console.log("🏠 loadRootDomainOrganization: Loading root domain organization:", rootDomainOrgId);
    
    const { data: orgData, error } = await supabase
      .from('organizations')
      .select('id, name, website_enabled, subdomain')
      .eq('id', rootDomainOrgId)
      .maybeSingle();

    if (error) {
      console.error("❌ loadRootDomainOrganization: Error loading root domain organization:", error);
      setContextError(`Error loading root domain organization: ${error.message}`);
      setIsContextReady(true);
      return null;
    }

    if (!orgData) {
      console.error("❌ loadRootDomainOrganization: Root domain organization not found");
      setContextError(`Root domain organization not found. Please contact support.`);
      setIsContextReady(true);
      return null;
    }

    console.log("✅ loadRootDomainOrganization: Found root domain organization:", orgData);
    return orgData;
    
  } catch (error) {
    console.error("💥 loadRootDomainOrganization: Unexpected error:", error);
    setContextError(`Failed to load root domain organization: ${error instanceof Error ? error.message : 'Unknown error'}`);
    setIsContextReady(true);
    return null;
  }
};
