
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import { isDevelopmentEnvironment } from '@/utils/domain';

export const useSubdomainRouter = () => {
  const navigate = useNavigate();
  const { organizationId, isSubdomainAccess } = useTenantContext();

  const navigateWithContext = useCallback((path: string, options?: { replace?: boolean }) => {
    console.log("navigateWithContext:", { path, isSubdomainAccess, organizationId });
    
    // For both subdomain and non-subdomain access, navigate directly within current domain
    // This ensures users with custom domains never leave their domain context
    console.log(`Navigation to: ${path} within current domain context`);
    navigate(path, options);
  }, [navigate, isSubdomainAccess]);

  const redirectToSubdomain = useCallback((subdomain: string, path: string = '/') => {
    if (isDevelopmentEnvironment()) {
      console.log("Development mode - not redirecting to subdomain");
      return;
    }

    // For production, redirect to actual subdomain
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const baseDomain = hostname.split('.').slice(-2).join('.');
    const port = window.location.port ? `:${window.location.port}` : '';
    
    const targetUrl = `${protocol}//${subdomain}.${baseDomain}${port}${path}`;
    console.log("Redirecting to subdomain:", targetUrl);
    window.location.href = targetUrl;
  }, []);

  const navigateToDashboard = useCallback((organizationId: string) => {
    // Always use organization ID for dashboard navigation to prevent 404s from name changes
    const dashboardPath = `/dashboard/${organizationId}`;
    console.log("Navigating to dashboard:", dashboardPath);
    navigateWithContext(dashboardPath);
  }, [navigateWithContext]);

  return {
    navigateWithContext,
    redirectToSubdomain,
    navigateToDashboard
  };
};
