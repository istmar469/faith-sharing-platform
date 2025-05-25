
/**
 * Validation and format checking utilities
 */

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
