
/**
 * Main exports for domain utilities
 */

// Environment utilities
export { isDevelopmentEnvironment, isLovablePreviewUrl } from './environmentUtils';

// Validation utilities
export { 
  isUuid, 
  isPreviewRoute, 
  getDnsConfigurationType 
} from './validationUtils';

// Domain detection utilities
export { isMainDomain, getMainDomain } from './domainDetectionUtils';

// Subdomain utilities
export { getSubdomain, extractSubdomain } from './subdomainUtils';

// Route utilities
export { cleanLegacyPath, getOrgAwarePath } from './routeUtils';
