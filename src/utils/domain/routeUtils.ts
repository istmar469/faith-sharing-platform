
/**
 * Route and path processing utilities
 */

/**
 * Clean up any legacy paths for compatibility
 */
export const cleanLegacyPath = (path: string): string => {
  // Convert old tenant-dashboard paths to dashboard
  if (path.includes('/tenant-dashboard')) {
    return '/dashboard';
  }
  return path;
};
