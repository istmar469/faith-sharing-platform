
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
    if ((pathname.startsWith('/tenant-dashboard/') && !pathname.includes(':organizationId')) ||
        (pathname.startsWith('/page-builder') && !pathname.includes(':pageId')) ||
        pathname.startsWith('/settings/')) {
      console.log("Not skipping subdomain detection for tenant-specific route:", pathname);
      return false;
    }
    
    // Check if path is in skip list
    const shouldSkip = skipSubdomainRoutes.some(route => pathname.startsWith(route));
    console.log(`${shouldSkip ? 'Skipping' : 'Not skipping'} subdomain detection for path:`, pathname);
    return shouldSkip;
  }, []);

  const shouldHandleOrgFromPath = useCallback((pathname: string) => {
    // Don't extract org ID if the path has a placeholder
    if (pathname.includes(':organizationId')) {
      console.log("Not extracting organization ID from path with placeholder:", pathname);
      return null;
    }
    
    const orgId = getOrganizationIdFromPath(pathname);
    if (orgId) {
      console.log("Extracted organization ID from path:", orgId);
    }
    return orgId;
  }, []);

  const shouldHandlePreviewSubdomain = useCallback((subdomain: string) => {
    if (!subdomain) return null;
    const previewMatch = subdomain.match(/^id-preview--(.+)$/i);
    if (previewMatch) {
      console.log("Preview subdomain detected:", subdomain);
    }
    return previewMatch;
  }, []);

  return {
    shouldSkipSubdomainDetection,
    shouldHandleOrgFromPath,
    shouldHandlePreviewSubdomain
  };
};
