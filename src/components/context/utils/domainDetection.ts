
import { isMainDomain } from '@/utils/domain';

// Helper function to check if a string is a UUID
export const isUuid = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Helper function to extract organization ID from Lovable development URLs
export const extractOrgIdFromLovableUrl = (hostname: string): string | null => {
  // Check if we're on lovable.dev, lovable.app, or lovableproject.com
  if (hostname.includes('lovable.dev') || hostname.includes('lovable.app') || hostname.includes('lovableproject.com')) {
    // Extract the UUID from URLs like: 59e200d0-3f66-4b1b-87e6-1e82901c785c.lovableproject.com
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      const potentialUuid = parts[0];
      if (isUuid(potentialUuid)) {
        console.log("extractOrgIdFromLovableUrl: Extracted organization ID from Lovable URL:", potentialUuid);
        return potentialUuid;
      }
    }
  }
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
  
  const lovableOrgId = extractOrgIdFromLovableUrl(hostname);
  const isMainDomainCheck = isMainDomain(hostname);
  
  let detectedSubdomain: string | null = null;
  
  if (!lovableOrgId && !isMainDomainCheck) {
    // Extract subdomain for custom domains
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      detectedSubdomain = parts[0];
    }
  }
  
  return {
    hostname,
    isMainDomain: isMainDomainCheck,
    detectedSubdomain,
    lovableOrgId
  };
};
