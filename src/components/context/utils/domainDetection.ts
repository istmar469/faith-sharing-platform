
import { isMainDomain } from '@/utils/domain';

// Helper function to check if a string is a UUID
export const isUuid = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Helper function to extract organization ID from Lovable development URLs
export const extractOrgIdFromLovableUrl = (hostname: string): string | null => {
  console.log("extractOrgIdFromLovableUrl: Checking hostname:", hostname);
  
  // Check if we're on any Lovable domain pattern
  if (hostname.includes('lovable.dev') || 
      hostname.includes('lovable.app') || 
      hostname.includes('lovableproject.com') ||
      hostname.includes('lovable-preview.com')) {
    
    console.log("extractOrgIdFromLovableUrl: Detected Lovable domain");
    
    // Extract the UUID from URLs like: 
    // - 59e200d0-3f66-4b1b-87e6-1e82901c785c.lovableproject.com
    // - 59e200d0-3f66-4b1b-87e6-1e82901c785c.lovable.dev
    // - 59e200d0-3f66-4b1b-87e6-1e82901c785c.project.lovable.dev
    const parts = hostname.split('.');
    console.log("extractOrgIdFromLovableUrl: Hostname parts:", parts);
    
    if (parts.length >= 2) {
      const potentialUuid = parts[0];
      console.log("extractOrgIdFromLovableUrl: Checking potential UUID:", potentialUuid);
      
      if (isUuid(potentialUuid)) {
        console.log("extractOrgIdFromLovableUrl: Valid UUID found:", potentialUuid);
        return potentialUuid;
      }
    }
    
    // Fallback: if the hostname itself is a UUID (for cases where the full hostname is just the UUID)
    if (isUuid(hostname)) {
      console.log("extractOrgIdFromLovableUrl: Hostname itself is a UUID:", hostname);
      return hostname;
    }
  }
  
  // Additional check for development environments where hostname might just be the UUID
  if (isUuid(hostname)) {
    console.log("extractOrgIdFromLovableUrl: Hostname is a standalone UUID:", hostname);
    return hostname;
  }
  
  console.log("extractOrgIdFromLovableUrl: No valid UUID found in hostname");
  return null;
};

/**
 * CRITICAL FIX: Enhanced subdomain detection for church-os.com domains
 */
const extractSubdomainFromChurchOS = (hostname: string): string | null => {
  console.log("extractSubdomainFromChurchOS: Processing hostname:", hostname);
  
  // Handle format: test3.church-os.com
  if (hostname.endsWith('.church-os.com') && hostname !== 'church-os.com' && hostname !== 'www.church-os.com') {
    const parts = hostname.split('.');
    if (parts.length === 3) {
      const subdomain = parts[0];
      console.log("extractSubdomainFromChurchOS: Found subdomain:", subdomain);
      return subdomain;
    }
  }
  
  // Handle legacy format: test3.churches.church-os.com
  if (hostname.includes('.churches.church-os.com')) {
    const parts = hostname.split('.');
    if (parts.length === 4 && parts[1] === 'churches' && parts[2] === 'church-os') {
      const subdomain = parts[0];
      console.log("extractSubdomainFromChurchOS: Found legacy subdomain:", subdomain);
      return subdomain;
    }
  }
  
  console.log("extractSubdomainFromChurchOS: No subdomain found");
  return null;
};

export interface DomainInfo {
  hostname: string;
  isMainDomain: boolean;
  detectedSubdomain: string | null;
  lovableOrgId: string | null;
}

export const analyzeDomain = (): DomainInfo => {
  const hostname = window.location.hostname;
  console.log("analyzeDomain: Analyzing hostname:", hostname);
  
  // CRITICAL: Check for Lovable organization ID first before any other processing
  const lovableOrgId = extractOrgIdFromLovableUrl(hostname);
  console.log("analyzeDomain: Lovable org ID:", lovableOrgId);
  
  const isMainDomainCheck = isMainDomain(hostname);
  console.log("analyzeDomain: Is main domain:", isMainDomainCheck);
  
  let detectedSubdomain: string | null = null;
  
  // Only try to extract subdomain if it's NOT a Lovable org ID and NOT a main domain
  if (!lovableOrgId && !isMainDomainCheck) {
    console.log("analyzeDomain: Attempting to extract subdomain");
    
    // CRITICAL FIX: Use enhanced church-os.com subdomain detection first
    detectedSubdomain = extractSubdomainFromChurchOS(hostname);
    
    // If not a church-os.com domain, try generic subdomain extraction
    if (!detectedSubdomain) {
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        detectedSubdomain = parts[0];
        console.log("analyzeDomain: Generic subdomain detected:", detectedSubdomain);
      }
    }
  }
  
  const result = {
    hostname,
    isMainDomain: isMainDomainCheck,
    detectedSubdomain,
    lovableOrgId
  };
  
  console.log("analyzeDomain: Final result:", result);
  return result;
};
