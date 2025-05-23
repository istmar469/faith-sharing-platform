
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import { extractSubdomain, isDevelopmentEnvironment } from '@/utils/domainUtils';

export const useSubdomainRouter = () => {
  const navigate = useNavigate();
  const { organizationId, isSubdomainAccess } = useTenantContext();

  const navigateWithContext = useCallback((path: string, options?: { replace?: boolean }) => {
    // For subdomain access, maintain the subdomain and ensure org context
    if (isSubdomainAccess && organizationId) {
      // If path doesn't include organization context, add it
      if (!path.includes(`/tenant-dashboard/${organizationId}`) && 
          (path.startsWith('/page-builder') || 
           path.startsWith('/settings') || 
           path.startsWith('/pages') || 
           path.startsWith('/events') || 
           path.startsWith('/donations') ||
           path === '/tenant-dashboard')) {
        
        const contextualPath = path === '/tenant-dashboard' 
          ? `/tenant-dashboard/${organizationId}`
          : `/tenant-dashboard/${organizationId}${path}`;
        
        navigate(contextualPath, options);
        return;
      }
    }
    
    // Default navigation
    navigate(path, options);
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
