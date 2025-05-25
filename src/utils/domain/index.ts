
/**
 * Main exports for domain utilities
 */

// Environment utilities
export { isDevelopmentEnvironment, isLovablePreviewUrl } from './environmentUtils';

// Validation utilities
export { 
  isUuid, 
  isTenantRoute, 
  isPreviewRoute, 
  getOrganizationIdFromPath, 
  getDnsConfigurationType 
} from './validationUtils';

// Domain detection utilities
export { isMainDomain, getMainDomain } from './domainDetectionUtils';

// Subdomain utilities
export { getSubdomain, extractSubdomain } from './subdomainUtils';

// Route utilities
export { cleanPathForSubdomain } from './routeUtils';
