
import { getOrganizationIdFromPath } from "@/utils/domain";
import { useCallback } from "react";

export const useRouteSkipping = () => {
  const shouldSkipSubdomainDetection = useCallback((pathname: string): boolean => {
    const skipSubdomainRoutes = [
      '/preview-domain/',
      '/login',
      '/signup',
      '/auth',
      '/diagnostic'
    ];
    
    if (pathname.startsWith('/page-builder')) {
      return true;
    }
    
    if (pathname.startsWith('/tenant-dashboard/') && !pathname.includes(':organizationId')) {
      return false;
    }
    
    return skipSubdomainRoutes.some(route => pathname.startsWith(route));
  }, []);

  const shouldHandleOrgFromPath = useCallback((pathname: string) => {
    if (pathname.includes(':organizationId')) {
      return null;
    }
    
    return getOrganizationIdFromPath(pathname);
  }, []);

  const shouldHandlePreviewSubdomain = useCallback((subdomain: string) => {
    if (!subdomain) return null;
    const previewMatch = subdomain.match(/^id-preview--(.+)$/i);
    return previewMatch;
  }, []);

  return {
    shouldSkipSubdomainDetection,
    shouldHandleOrgFromPath,
    shouldHandlePreviewSubdomain
  };
};
