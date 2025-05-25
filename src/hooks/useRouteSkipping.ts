
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
    
    return skipSubdomainRoutes.some(route => pathname.startsWith(route));
  }, []);

  const shouldHandlePreviewSubdomain = useCallback((subdomain: string) => {
    if (!subdomain) return null;
    const previewMatch = subdomain.match(/^id-preview--(.+)$/i);
    return previewMatch;
  }, []);

  return {
    shouldSkipSubdomainDetection,
    shouldHandlePreviewSubdomain
  };
};
