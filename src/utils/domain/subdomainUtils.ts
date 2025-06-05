
/**
 * Subdomain extraction and processing utilities
 */

import { isMainDomain } from './domainDetectionUtils';
import { isDevelopmentEnvironment } from './environmentUtils';
import { isUuid } from './validationUtils';

// Cache for subdomain extraction to prevent repeated parsing
let subdomainCache: { hostname: string; subdomain: string | null } | null = null;

/**
 * Extract subdomain from a hostname or preview URL
 */
export const getSubdomain = (isPreviewUrl: boolean, pathname: string): string | null => {
  if (isPreviewUrl) {
    const parts = pathname.split('/');
    return parts.length > 2 ? parts[2] : null;
  } else {
    const hostnameParts = window.location.hostname.split(".");
    const isSubdomainPresent = hostnameParts.length > 2 && 
                          hostnameParts[0] !== 'www';
    
    if (isSubdomainPresent) {
      const potentialSubdomain = hostnameParts[0];
      if (!isUuid(potentialSubdomain)) {
        return potentialSubdomain;
      }
    }
  }
  return null;
};

/**
 * ENHANCED: Extract clean subdomain from hostname with improved logging and logic
 */
export const extractSubdomain = (hostname: string): string | null => {
  // Use cache if hostname hasn't changed
  if (subdomainCache && subdomainCache.hostname === hostname) {
    console.log("📋 extractSubdomain: Using cached result for", hostname, "->", subdomainCache.subdomain);
    return subdomainCache.subdomain;
  }
  
  console.log("🔍 extractSubdomain: Processing hostname:", hostname);
  
  let result: string | null = null;
  
  // CRITICAL: Check main domain first to avoid false subdomain detection
  if (isMainDomain(hostname)) {
    console.log("🏠 extractSubdomain: Identified as main domain, no subdomain");
    result = null;
  } else {
    const parts = hostname.split('.');
    console.log("📋 extractSubdomain: Hostname parts:", parts);
    
    // ENHANCED: Handle localhost subdomains in development (test3.localhost)
    if (isDevelopmentEnvironment() && hostname.includes('localhost')) {
      if (parts.length >= 2) {
        // Extract subdomain from test3.localhost
        result = parts[0];
        console.log("🏠 extractSubdomain: Found localhost development subdomain:", result);
      }
    }
    // ENHANCED: Handle format: subdomain.church-os.com (3 parts) - like test3.church-os.com
    else if (parts.length === 3 && hostname.endsWith('church-os.com')) {
      // Only extract subdomain if it's NOT the main domain
      if (hostname !== 'www.church-os.com' && hostname !== 'church-os.com') {
        result = parts[0];
        console.log("⛪ extractSubdomain: Found church-os.com subdomain:", result);
      }
    }
    // Handle format: subdomain.churches.church-os.com (4 parts) - legacy format
    else if (parts.length === 4 && parts[1] === 'churches' && parts[2] === 'church-os') {
      result = parts[0];
      console.log("⛪ extractSubdomain: Found legacy churches.church-os.com subdomain:", result);
    }
    // Development/test environment subdomain detection for Lovable
    else if (isDevelopmentEnvironment() && hostname.includes('lovable')) {
      if (parts.length >= 3) {
        result = parts[0];
        console.log("🎯 extractSubdomain: Found lovable subdomain:", result);
      }
    }
    // ENHANCED: Handle custom domains - if it's not a main domain and has at least one dot, treat first part as subdomain
    else if (parts.length >= 2 && !isMainDomain(hostname)) {
      // Additional check: don't treat UUID-like strings as subdomains for custom domains
      const potentialSubdomain = parts[0];
      if (!isUuid(potentialSubdomain)) {
        result = potentialSubdomain;
        console.log("🌐 extractSubdomain: Found custom domain subdomain:", result);
      } else {
        console.log("🚫 extractSubdomain: Skipping UUID-like subdomain for custom domain:", potentialSubdomain);
      }
    }
  }
  
  // Cache the result
  subdomainCache = { hostname, subdomain: result };
  
  console.log("🎯 extractSubdomain: Final result for", hostname, "->", result);
  
  return result;
};
