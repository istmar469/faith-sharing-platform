import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import { isDevelopmentEnvironment } from '@/utils/domain';

export const useSubdomainRouter = () => {
  const navigate = useNavigate();
  const { organizationId, isSubdomainAccess } = useTenantContext();

  const navigateWithContext = useCallback((path: string, options?: { replace?: boolean }) => {
    console.log("navigateWithContext:", { path, isSubdomainAccess, organizationId });
    
    // For subdomain access, ALWAYS navigate directly with simple paths
    if (isSubdomainAccess) {
      // Clean up any tenant-dashboard paths that might come through
      if (path.includes('/tenant-dashboard/')) {
        console.log("Cleaning up tenant path for subdomain navigation");
        const parts = path.split('/tenant-dashboard/');
        if (parts.length > 1) {
          const orgAndPath = parts[1].split('/', 2);
          if (orgAndPath.length > 1) {
            const cleanPath = '/' + orgAndPath[1];
            console.log("Subdomain navigation cleaned to:", cleanPath);
            navigate(cleanPath, options);
            return;
          }
        }
      }
      
      console.log("Subdomain navigation to:", path);
      navigate(path, options);
      return;
    }
    
    // For non-subdomain access, add organization context if needed
    if (organizationId && !path.startsWith('/tenant-dashboard/')) {
      if (path === '/tenant-dashboard') {
        navigate(`/tenant-dashboard/${organizationId}`, options);
      } else if (path.startsWith('/page-builder') || 
                 path.startsWith('/settings') || 
                 path.startsWith('/pages') || 
                 path.startsWith('/events') || 
                 path.startsWith('/donations') ||
                 path.startsWith('/templates') ||
                 path.startsWith('/livestream') ||
                 path.startsWith('/communication')) {
        navigate(`/tenant-dashboard/${organizationId}${path}`, options);
      } else {
        navigate(path, options);
      }
    } else {
      navigate(path, options);
    }
  }, [navigate, organizationId, isSubdomainAccess]);

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

  return {
    navigateWithContext,
    redirectToSubdomain
  };
};
