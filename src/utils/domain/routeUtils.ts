
/**
 * Route and path processing utilities
 */

/**
 * Clean up any legacy paths for compatibility
 */
export const cleanLegacyPath = (path: string): string => {
  // Convert old tenant-dashboard paths to dashboard
  if (path.includes('/tenant-dashboard/')) {
    // Extract organization ID from path and convert to new format
    const parts = path.split('/tenant-dashboard/');
    if (parts.length > 1) {
      const orgIdAndPath = parts[1].split('/', 2);
      const orgId = orgIdAndPath[0];
      const remainingPath = orgIdAndPath[1] ? `?tab=${orgIdAndPath[1]}` : '';
      return `/dashboard/${orgId}${remainingPath}`;
    }
    return '/dashboard';
  }
  return path;
};

/**
 * Convert organization-aware paths for new routing system
 */
export const getOrgAwarePath = (path: string, organizationId?: string): string => {
  // If we have an organization ID and the path doesn't already include it
  if (organizationId && !path.includes(organizationId)) {
    // For dashboard paths, include the organization ID
    if (path === '/dashboard' || path.startsWith('/dashboard?')) {
      return `/dashboard/${organizationId}${path.includes('?') ? path.substring(path.indexOf('?')) : ''}`;
    }
  }
  
  return cleanLegacyPath(path);
};
