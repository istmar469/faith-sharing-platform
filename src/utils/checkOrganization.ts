import { supabase } from '@/integrations/supabase/client';

/**
 * Extracts just the subdomain from a full domain (e.g., 'test3' from 'test3.church-os.com')
 */
function extractPureSubdomain(domain: string): string {
  // If it's already just a subdomain (no dots), return as is
  if (!domain.includes('.')) {
    return domain;
  }
  // Otherwise, extract the first part before the first dot
  return domain.split('.')[0];
}

/**
 * Utility function to check if an organization with a specific subdomain exists
 */
export async function checkOrganization(subdomainOrDomain: string) {
  // First try to extract just the subdomain part
  const pureSubdomain = extractPureSubdomain(subdomainOrDomain);
  
  console.log(`Checking for organization with subdomain/domain: "${subdomainOrDomain}" (extracted subdomain: "${pureSubdomain}")`);
  
  try {
    // First, try exact match on subdomain
    const { data: exactSubdomainData, error: exactSubdomainError } = await supabase
      .from('organizations')
      .select('id, name, website_enabled, subdomain, custom_domain')
      .eq('subdomain', subdomainOrDomain)
      .maybeSingle();
    
    if (exactSubdomainError) {
      console.error('Error querying organization by exact subdomain:', exactSubdomainError);
    } else if (exactSubdomainData) {
      console.log('Organization found by exact subdomain match:', exactSubdomainData);
      return exactSubdomainData;
    }
    
    // Try with the extracted pure subdomain
    const { data: pureSubdomainData, error: pureSubdomainError } = await supabase
      .from('organizations')
      .select('id, name, website_enabled, subdomain, custom_domain')
      .eq('subdomain', pureSubdomain)
      .maybeSingle();
    
    if (pureSubdomainError) {
      console.error('Error querying organization by pure subdomain:', pureSubdomainError);
    } else if (pureSubdomainData) {
      console.log('Organization found by pure subdomain match:', pureSubdomainData);
      return pureSubdomainData;
    }
    
    // Try custom domain match
    const { data: customDomainData, error: customDomainError } = await supabase
      .from('organizations')
      .select('id, name, website_enabled, subdomain, custom_domain')
      .eq('custom_domain', subdomainOrDomain)
      .maybeSingle();
    
    if (customDomainError) {
      console.error('Error querying organization by custom domain:', customDomainError);
    } else if (customDomainData) {
      console.log('Organization found by custom domain match:', customDomainData);
      return customDomainData;
    }
    
    console.log(`No organization found with subdomain/domain: "${subdomainOrDomain}"`);
    return null;
    
  } catch (error) {
    console.error('Unexpected error in checkOrganization:', error);
    return null;
  }
}

/**
 * Manual test function for development/debugging
 * Call this function from browser console: testOrganizationChecks()
 */
export const testOrganizationChecks = async () => {
  console.log('=== Manual Organization Check Tests ===');
  
  console.log('Testing "test3"...');
  await checkOrganization('test3');
  
  console.log('Testing "test3.church-os.com"...');
  await checkOrganization('test3.church-os.com');
  
  console.log('=== Manual tests completed ===');
};

// Make the test function available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).testOrganizationChecks = testOrganizationChecks;
}
