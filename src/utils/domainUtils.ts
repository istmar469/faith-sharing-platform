
/**
 * Domain and subdomain utility functions
 */

/**
 * Check if we're in a development environment
 */
export const isDevelopmentEnvironment = (): boolean => {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || 
         hostname.endsWith('lovable.dev') || 
         hostname.endsWith('lovable.app') ||
         hostname === '127.0.0.1';
};

/**
 * Check if a string is in UUID format
 */
export const isUuid = (str: string): boolean => {
  // More accurate UUID regex pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(str);
};

/**
 * Check if current route is a tenant route
 */
export const isTenantRoute = (pathname: string): boolean => {
  // Verify this is a tenant dashboard route but NOT a subdomain
  return pathname.startsWith('/tenant-dashboard/');
};

/**
 * Check if current route is a subdomain preview
 */
export const isPreviewRoute = (pathname: string): boolean => {
  return pathname.startsWith('/preview-domain/');
};

/**
 * Extract organization ID from tenant dashboard URL path
 */
export const getOrganizationIdFromPath = (pathname: string): string | null => {
  if (pathname.startsWith('/tenant-dashboard/')) {
    const parts = pathname.split('/');
    const potentialId = parts.length > 2 ? parts[2] : null;
    
    // Only return if it's a valid UUID format
    return potentialId && isUuid(potentialId) ? potentialId : null;
  }
  return null;
};

/**
 * Extract subdomain from a hostname or preview URL
 */
export const getSubdomain = (isPreviewUrl: boolean, pathname: string): string | null => {
  if (isPreviewUrl) {
    const parts = pathname.split('/');
    return parts.length > 2 ? parts[2] : null;
  } else {
    // Check if there are more than 2 parts in the hostname
    // And that it's not starting with 'www'
    const hostnameParts = window.location.hostname.split(".");
    const isSubdomainPresent = hostnameParts.length > 2 && 
                          hostnameParts[0] !== 'www';
    
    if (isSubdomainPresent) {
      // Make sure the subdomain isn't a UUID
      const potentialSubdomain = hostnameParts[0];
      if (!isUuid(potentialSubdomain)) {
        return potentialSubdomain;
      }
    }
  }
  return null;
};

/**
 * Check if this is one of our main domain configurations
 * Includes both church-os.com and churches.church-os.com
 */
export const isMainDomain = (hostname: string): boolean => {
  return hostname === 'church-os.com' || 
         hostname === 'churches.church-os.com' ||
         hostname === 'www.church-os.com' || 
         hostname === 'www.churches.church-os.com';
};

/**
 * Extract clean subdomain from hostname
 * Handles both church-os.com and churches.church-os.com formats
 * Now more verbose with detailed logging for debugging purposes
 */
export const extractSubdomain = (hostname: string): string | null => {
  // Add debug logging
  console.log("extractSubdomain: Processing hostname:", hostname);
  
  // If it's one of our main domains, there's no subdomain
  if (isMainDomain(hostname)) {
    console.log("extractSubdomain: This is a main domain, no subdomain");
    return null;
  }
  
  // For development environments, we need to handle differently
  if (isDevelopmentEnvironment()) {
    console.log("extractSubdomain: Development environment detected");
    
    // For Lovable and Lovable.dev preview URLs, there might be tenants in URL params instead
    if (hostname.endsWith('lovable.dev') || hostname.endsWith('lovable.app')) {
      console.log("extractSubdomain: Lovable preview URL detected, subdomain extraction skipped");
      return null;
    }
  }
  
  // Split the hostname into parts
  const parts = hostname.split('.');
  console.log("extractSubdomain: Hostname parts:", parts);
  
  // Handle special case for format: subdomain.churches.church-os.com
  if (parts.length > 3 && parts[1] === 'churches' && parts[2] === 'church-os') {
    console.log("extractSubdomain: Detected subdomain.churches.church-os.com format, subdomain:", parts[0]);
    return parts[0];
  }
  
  // Standard case for subdomain.church-os.com or subdomain.churches.church-os.com
  if (parts.length > 2) {
    if (parts[1] === 'church-os' || parts[1] === 'churches') {
      console.log("extractSubdomain: Standard subdomain format detected, subdomain:", parts[0]);
      return parts[0];
    }
  }
  
  // Special case for development on localhost or preview environments
  if (parts[0] === 'localhost' || hostname.includes('lovable')) {
    console.log("extractSubdomain: Development environment detected");
    return null;
  }
  
  console.log("extractSubdomain: No subdomain pattern matched");
  return null;
};

/**
 * Get the main domain without subdomain
 */
export const getMainDomain = (hostname: string): string => {
  // Return the main domain part (last two parts of the hostname)
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }
  return hostname; // Fallback to the full hostname
};

/**
 * Check if a hostname is a Lovable project preview URL
 */
export const isLovablePreviewUrl = (hostname: string): boolean => {
  return hostname.includes('lovable.dev') || hostname.includes('lovable.app');
};
