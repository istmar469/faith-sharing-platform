
import { getOrganizationIdFromPath } from "@/utils/domainUtils";

export const useRouteSkipping = () => {
  const shouldSkipSubdomainDetection = (pathname: string): boolean => {
    const skipSubdomainRoutes = [
      '/preview-domain/',
      '/login',
      '/signup',
      '/auth',
      '/diagnostic'
    ];
    
    // Don't skip tenant-specific routes
    if (pathname.startsWith('/tenant-dashboard/') ||
        pathname.startsWith('/page-builder') ||
        pathname.startsWith('/settings/')) {
      return false;
    }
    
    return skipSubdomainRoutes.some(route => pathname.startsWith(route));
  };

  const shouldHandleOrgFromPath = (pathname: string) => {
    return getOrganizationIdFromPath(pathname);
  };

  const shouldHandlePreviewSubdomain = (subdomain: string) => {
    return subdomain?.match(/^id-preview--(.+)$/i);
  };

  return {
    shouldSkipSubdomainDetection,
    shouldHandleOrgFromPath,
    shouldHandlePreviewSubdomain
  };
};
