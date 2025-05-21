
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
