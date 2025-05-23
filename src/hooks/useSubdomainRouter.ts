
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import { isDevelopmentEnvironment } from '@/utils/domainUtils';

export const useSubdomainRouter = () => {
  const navigate = useNavigate();
  const { organizationId, isSubdomainAccess } = useTenantContext();

  const navigateWithContext = useCallback((path: string, options?: { replace?: boolean }) => {
    // For subdomain access, navigate directly without prefixes
    if (isSubdomainAccess) {
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
                 path.startsWith('/donations')) {
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
      // For development, use organization-specific routing
      if (organizationId) {
        navigate(`/tenant-dashboard/${organizationId}${path === '/' ? '' : path}`);
      }
      return;
    }

    // For production, redirect to actual subdomain
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const baseDomain = hostname.split('.').slice(-2).join('.');
    const port = window.location.port ? `:${window.location.port}` : '';
    
    window.location.href = `${protocol}//${subdomain}.${baseDomain}${port}${path}`;
  }, [navigate, organizationId]);

  return {
    navigateWithContext,
    redirectToSubdomain
  };
};
