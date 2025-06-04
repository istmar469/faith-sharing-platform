
/**
 * Domain and main domain detection utilities
 */

import { isDevelopmentEnvironment } from './environmentUtils';

/**
 * Check if this is one of our main domain configurations
 */
export const isMainDomain = (hostname: string): boolean => {
  console.log("isMainDomain: Checking hostname:", hostname);
  
  // Exact matches for main domains (no subdomains)
  if (hostname === 'localhost' ||
      hostname === 'church-os.com' || 
      hostname === 'www.church-os.com') {
    console.log("isMainDomain: Exact main domain match:", hostname);
    return true;
  }
  
  // For localhost in development, only bare localhost is main domain
  if (hostname === 'localhost') {
    console.log("isMainDomain: Localhost main domain:", hostname);
    return true;
  }
  
  // For development environments, check if it's a base lovable domain
  if (isDevelopmentEnvironment()) {
    // Check for UUID pattern at start (indicates Lovable org subdomain)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    if (uuidRegex.test(hostname)) {
      console.log("isMainDomain: UUID subdomain detected:", hostname);
      return false;
    }
    
    // Base lovable domains are main domains
    if (hostname.endsWith('.lovable.dev') || 
        hostname.endsWith('.lovable.app') || 
        hostname.endsWith('.lovableproject.com')) {
      const parts = hostname.split('.');
      if (parts.length === 3 && parts[1] === 'project') {
        console.log("isMainDomain: Lovable project main domain:", hostname);
        return true;
      }
    }
  }
  
  console.log("isMainDomain: Not a main domain:", hostname);
  return false;
};

/**
 * Get the main domain without subdomain
 */
export const getMainDomain = (hostname: string): string => {
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }
  return hostname;
};
