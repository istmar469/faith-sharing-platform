
import { isMainDomain } from '@/utils/domain';

// Helper function to check if a string is a UUID
export const isUuid = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Helper function to extract organization ID from Lovable development URLs
export const extractOrgIdFromLovableUrl = (hostname: string): string | null => {
  console.log("🔍 extractOrgIdFromLovableUrl: Checking hostname:", hostname);
  
  // Check if we're on any Lovable domain pattern
  if (hostname.includes('lovable.dev') || 
      hostname.includes('lovable.app') || 
      hostname.includes('lovableproject.com') ||
      hostname.includes('lovable-preview.com')) {
    
    console.log("🎯 extractOrgIdFromLovableUrl: Detected Lovable domain");
    
    // Extract the UUID from URLs like: 
    // - 59e200d0-3f66-4b1b-87e6-1e82901c785c.lovableproject.com
    // - 59e200d0-3f66-4b1b-87e6-1e82901c785c.lovable.dev
    // - 59e200d0-3f66-4b1b-87e6-1e82901c785c.project.lovable.dev
    const parts = hostname.split('.');
    console.log("📋 extractOrgIdFromLovableUrl: Hostname parts:", parts);
    
    if (parts.length >= 2) {
      const potentialUuid = parts[0];
      console.log("🔎 extractOrgIdFromLovableUrl: Checking potential UUID:", potentialUuid);
      
      if (isUuid(potentialUuid)) {
        console.log("✅ extractOrgIdFromLovableUrl: Valid UUID found:", potentialUuid);
        return potentialUuid;
      }
    }
    
    // Fallback: if the hostname itself is a UUID (for cases where the full hostname is just the UUID)
    if (isUuid(hostname)) {
      console.log("🎯 extractOrgIdFromLovableUrl: Hostname itself is a UUID:", hostname);
      return hostname;
    }
  }
  
  // Additional check for development environments where hostname might just be the UUID
  if (isUuid(hostname)) {
    console.log("🔍 extractOrgIdFromLovableUrl: Hostname is a standalone UUID:", hostname);
    return hostname;
  }
  
  console.log("❌ extractOrgIdFromLovableUrl: No valid UUID found in hostname");
  return null;
};

/**
 * ENHANCED: Subdomain detection for church-os.com domains with detailed logging
 */
const extractSubdomainFromChurchOS = (hostname: string): string | null => {
  console.log("🔍 extractSubdomainFromChurchOS: Processing hostname:", hostname);
  
  // Handle format: test3.church-os.com
  if (hostname.endsWith('.church-os.com') && hostname !== 'church-os.com' && hostname !== 'www.church-os.com') {
    const parts = hostname.split('.');
    console.log("📋 extractSubdomainFromChurchOS: Split parts:", parts);
    
    if (parts.length === 3) {
      const subdomain = parts[0];
      console.log("✅ extractSubdomainFromChurchOS: Found direct subdomain:", subdomain);
      return subdomain;
    }
  }
  
  // Handle legacy format: test3.churches.church-os.com
  if (hostname.includes('.churches.church-os.com')) {
    const parts = hostname.split('.');
    console.log("📋 extractSubdomainFromChurchOS: Legacy format parts:", parts);
    
    if (parts.length === 4 && parts[1] === 'churches' && parts[2] === 'church-os') {
      const subdomain = parts[0];
      console.log("✅ extractSubdomainFromChurchOS: Found legacy subdomain:", subdomain);
      return subdomain;
    }
  }
  
  console.log("❌ extractSubdomainFromChurchOS: No subdomain found");
  return null;
};

export interface DomainInfo {
  hostname: string;
  isMainDomain: boolean;
  detectedSubdomain: string | null;
  lovableOrgId: string | null;
  debugInfo: {
    hostnameParts: string[];
    isChurchOSDomain: boolean;
    isLovableDomain: boolean;
    extractionMethod: string | null;
  };
}

export const analyzeDomain = (): DomainInfo => {
  const hostname = window.location.hostname;
  console.log("🔍 analyzeDomain: Starting analysis for hostname:", hostname);
  
  const hostnameParts = hostname.split('.');
  const isChurchOSDomain = hostname.includes('church-os.com');
  const isLovableDomain = hostname.includes('lovable');
  
  console.log("📋 analyzeDomain: Initial analysis:", {
    hostname,
    hostnameParts,
    isChurchOSDomain,
    isLovableDomain
  });
  
  // CRITICAL: Check for Lovable organization ID first before any other processing
  const lovableOrgId = extractOrgIdFromLovableUrl(hostname);
  console.log("🎯 analyzeDomain: Lovable org ID result:", lovableOrgId);
  
  const isMainDomainCheck = isMainDomain(hostname);
  console.log("🏠 analyzeDomain: Is main domain:", isMainDomainCheck);
  
  let detectedSubdomain: string | null = null;
  let extractionMethod: string | null = null;
  
  // Only try to extract subdomain if it's NOT a Lovable org ID and NOT a main domain
  if (!lovableOrgId && !isMainDomainCheck) {
    console.log("🔍 analyzeDomain: Attempting subdomain extraction");
    
    // ENHANCED: Use specific church-os.com subdomain detection first
    if (isChurchOSDomain) {
      console.log("⛪ analyzeDomain: Using church-os.com specific extraction");
      detectedSubdomain = extractSubdomainFromChurchOS(hostname);
      extractionMethod = detectedSubdomain ? 'church-os-specific' : null;
    }
    
    // If not a church-os.com domain or extraction failed, try generic extraction
    if (!detectedSubdomain && hostnameParts.length >= 2) {
      console.log("🔍 analyzeDomain: Using generic subdomain extraction");
      detectedSubdomain = hostnameParts[0];
      extractionMethod = 'generic';
      console.log("📝 analyzeDomain: Generic subdomain detected:", detectedSubdomain);
    }
  } else {
    console.log("⏭️ analyzeDomain: Skipping subdomain extraction (Lovable org or main domain)");
  }
  
  const result = {
    hostname,
    isMainDomain: isMainDomainCheck,
    detectedSubdomain,
    lovableOrgId,
    debugInfo: {
      hostnameParts,
      isChurchOSDomain,
      isLovableDomain,
      extractionMethod
    }
  };
  
  console.log("🎯 analyzeDomain: Final result:", result);
  return result;
};
