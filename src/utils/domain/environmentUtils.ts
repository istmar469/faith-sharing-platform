
/**
 * Environment detection utilities
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
 * Check if a hostname is a Lovable project preview URL
 */
export const isLovablePreviewUrl = (hostname: string): boolean => {
  return hostname.includes('lovable.dev') || hostname.includes('lovable.app');
};
