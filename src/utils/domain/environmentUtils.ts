
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

/**
 * Check if email verification should be required
 */
export const shouldRequireEmailVerification = (): boolean => {
  // Always require email verification in production
  // Skip in development for easier testing
  return !isDevelopmentEnvironment();
};

/**
 * Get the environment name
 */
export const getEnvironmentName = (): string => {
  if (isDevelopmentEnvironment()) {
    return 'development';
  }
  return 'production';
};

/**
 * Get the current domain based on the hostname
 */
export const getCurrentDomain = (): string => {
  const hostname = window.location.hostname;
  
  // Handle localhost specifically
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'localhost';
  }
  
  // Handle Lovable environments
  if (hostname.includes('lovable.dev')) {
    return 'lovable.dev';
  }
  
  if (hostname.includes('lovable.app')) {
    return 'lovable.app';
  }
  
  // Default to production domain
  return 'church-os.com';
};
