/**
 * Domain and subdomain utility functions
 */

// Cache for subdomain extraction to prevent repeated parsing
let subdomainCache: { hostname: string; subdomain: string | null } | null = null;

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
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(str);
};

/**
 * Check if current route is a tenant route
 */
export const isTenantRoute = (pathname: string): boolean => {
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
 * Check if this is one of our main domain configurations (FIXED to properly exclude subdomains)
 */
export const isMainDomain = (hostname: string): boolean => {
  console.log("isMainDomain: Checking hostname:", hostname);
  
  // Exact matches for main domains
  if (hostname === 'localhost' ||
      hostname === 'church-os.com' || 
      hostname === 'www.church-os.com') {
    console.log("isMainDomain: Exact main domain match:", hostname);
    return true;
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
  
  // CRITICAL FIX: Any hostname with church-os.com that has more than 2 parts is a subdomain
  if (hostname.includes('church-os.com')) {
    const parts = hostname.split('.');
    if (parts.length > 2) {
      console.log("isMainDomain: church-os.com subdomain detected:", hostname);
      return false;
    }
  }
  
  console.log("isMainDomain: Not a main domain:", hostname);
  return false;
};

/**
 * Extract clean subdomain from hostname with caching and improved logic
 */
export const extractSubdomain = (hostname: string): string | null => {
  // Use cache if hostname hasn't changed
  if (subdomainCache && subdomainCache.hostname === hostname) {
    console.log("extractSubdomain: Using cached result for", hostname, "->", subdomainCache.subdomain);
    return subdomainCache.subdomain;
  }
  
  console.log("extractSubdomain: Processing hostname:", hostname);
  
  let result: string | null = null;
  
  if (isMainDomain(hostname)) {
    console.log("extractSubdomain: Identified as main domain, no subdomain");
    result = null;
  } else {
    const parts = hostname.split('.');
    console.log("extractSubdomain: Hostname parts:", parts);
    
    // CRITICAL FIX: Handle format: subdomain.church-os.com (3 parts) - like test-three.church-os.com
    if (parts.length === 3 && parts[1] === 'church-os' && parts[2] === 'com') {
      result = parts[0];
      console.log("extractSubdomain: Found church-os.com subdomain:", result);
    }
    // Handle format: subdomain.churches.church-os.com (4 parts) - legacy format
    else if (parts.length === 4 && parts[1] === 'churches' && parts[2] === 'church-os') {
      result = parts[0];
      console.log("extractSubdomain: Found legacy churches.church-os.com subdomain:", result);
    }
    // Development/test environment subdomain detection
    else if (isDevelopmentEnvironment()) {
      console.log("extractSubdomain: Processing development environment");
      
      if (hostname.includes('lovable')) {
        if (parts.length >= 3) {
          result = parts[0];
          console.log("extractSubdomain: Found lovable subdomain:", result);
        }
      }
      
      if (parts.length >= 2 && hostname.endsWith('.localhost')) {
        result = parts[0];
        console.log("extractSubdomain: Found localhost subdomain:", result);
      }
    }
    // Handle custom domains - if it's not a main domain and has at least one dot, treat first part as subdomain
    else if (parts.length >= 2) {
      result = parts[0];
      console.log("extractSubdomain: Found custom domain subdomain:", result);
    }
  }
  
  // Cache the result
  subdomainCache = { hostname, subdomain: result };
  
  console.log("extractSubdomain: Final result for", hostname, "->", result);
  
  return result;
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

/**
 * Check if a hostname is a Lovable project preview URL
 */
export const isLovablePreviewUrl = (hostname: string): boolean => {
  return hostname.includes('lovable.dev') || hostname.includes('lovable.app');
};

/**
 * Check DNS configuration type based on hostname
 */
export const getDnsConfigurationType = (hostname: string): string | null => {
  const parts = hostname.split('.');
  
  if (parts.length === 4 && parts[1] === 'churches' && parts[2] === 'church-os') {
    return 'legacy'; 
  }
  
  if (parts.length === 3 && parts[1] === 'church-os') {
    return 'direct';
  }
  
  return null;
};

/**
 * Clean up tenant-dashboard paths for subdomain access
 */
export const cleanPathForSubdomain = (path: string): string => {
  if (path.includes('/tenant-dashboard/')) {
    const parts = path.split('/tenant-dashboard/');
    if (parts.length > 1) {
      const orgAndPath = parts[1].split('/', 2);
      if (orgAndPath.length > 1) {
        return '/' + orgAndPath[1];
      }
    }
  }
  return path;
};
