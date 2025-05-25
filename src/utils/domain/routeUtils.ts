
/**
 * Route and path processing utilities
 */

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
