
import { useTenantContext } from '@/components/context/TenantContext';

/**
 * Route validation utilities to prevent navigation issues
 */

export interface RouteContext {
  isSubdomainAccess: boolean;
  organizationId: string | null;
  pathname: string;
}

/**
 * Validate if a route is accessible in the current context
 */
export const validateRoute = (route: string, context: RouteContext): boolean => {
  const { isSubdomainAccess, organizationId, pathname } = context;
  
  // Page builder routes require organization context
  if (route.startsWith('/page-builder')) {
    if (isSubdomainAccess) {
      // Subdomain access should always have org context
      return true;
    } else {
      // Root domain access needs explicit org ID or will show org selector
      return true; // Let it handle gracefully with org selection
    }
  }
  
  // Dashboard routes
  if (route.startsWith('/dashboard')) {
    return true; // Dashboard handles its own context validation
  }
  
  // Site builder routes require organization context
  if (route.startsWith('/site-builder')) {
    return !!organizationId || isSubdomainAccess;
  }
  
  // Public routes are always accessible
  if (['/', '/auth', '/diagnostic'].includes(route)) {
    return true;
  }
  
  return true;
};

/**
 * Get the appropriate route for the current context
 */
export const getContextAwareRoute = (route: string, context: RouteContext): string => {
  const { isSubdomainAccess, organizationId } = context;
  
  // Handle page builder routes
  if (route.startsWith('/page-builder')) {
    if (!isSubdomainAccess && organizationId && !route.includes('organization_id')) {
      const separator = route.includes('?') ? '&' : '?';
      return `${route}${separator}organization_id=${organizationId}`;
    }
    return route;
  }
  
  // Handle dashboard routes
  if (route === '/dashboard' && !isSubdomainAccess && organizationId) {
    return `/dashboard/${organizationId}`;
  }
  
  return route;
};

/**
 * Development mode route debugging
 */
export const debugRoute = (originalRoute: string, finalRoute: string, context: RouteContext) => {
  if (process.env.NODE_ENV === 'development') {
    console.group('Route Navigation Debug');
    console.log('Original route:', originalRoute);
    console.log('Final route:', finalRoute);
    console.log('Context:', context);
    console.log('Is valid:', validateRoute(finalRoute, context));
    console.groupEnd();
  }
};
