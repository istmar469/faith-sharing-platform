
import { getOrganizationIdFromPath } from "@/utils/domainUtils";
import { useCallback } from "react";

export const useRouteSkipping = () => {
  const shouldSkipSubdomainDetection = useCallback((pathname: string): boolean => {
    // Define routes where we skip subdomain detection
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
  }, []);

  const shouldHandleOrgFromPath = useCallback((pathname: string) => {
    return getOrganizationIdFromPath(pathname);
  }, []);

  const shouldHandlePreviewSubdomain = useCallback((subdomain: string) => {
    if (!subdomain) return null;
    return subdomain.match(/^id-preview--(.+)$/i);
  }, []);

  return {
    shouldSkipSubdomainDetection,
    shouldHandleOrgFromPath,
    shouldHandlePreviewSubdomain
  };
};
