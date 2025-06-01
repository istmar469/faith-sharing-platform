
/**
 * Domain and main domain detection utilities
 */

import { isDevelopmentEnvironment } from './environmentUtils';

/**
 * Check if this is one of our main domain configurations (FIXED to properly exclude subdomains)
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
  
  // CRITICAL FIX for localhost subdomains in development
  if (hostname.includes('localhost')) {
    const parts = hostname.split('.');
    if (parts.length > 1) {
      // If it has a subdomain like test3.localhost, it's NOT a main domain
      console.log("isMainDomain: Localhost subdomain detected:", hostname);
      return false;
    }
  }
  
  // Development environment matches - but only for the base lovable domains
  if (hostname.includes('lovable.dev') || hostname.includes('lovable.app')) {
    const parts = hostname.split('.');
    // For lovable domains, if it has more than 2 parts (like abc.project.lovable.dev), it's a subdomain
    if (parts.length > 2) {
      console.log("isMainDomain: Lovable subdomain detected:", hostname);
      return false;
    }
    console.log("isMainDomain: Lovable main domain:", hostname);
    return true;
  }
  
  // CRITICAL FIX: For church-os.com domains, only the exact match is main domain
  if (hostname.endsWith('church-os.com')) {
    // church-os.com = main domain (2 parts)
    // anything.church-os.com = subdomain (3+ parts)
    if (hostname === 'church-os.com' || hostname === 'www.church-os.com') {
      console.log("isMainDomain: church-os.com main domain:", hostname);
      return true;
    } else {
      console.log("isMainDomain: church-os.com subdomain detected:", hostname);
      return false;
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
