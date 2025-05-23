
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { extractSubdomain, isDevelopmentEnvironment } from '@/utils/domainUtils';
import { useTenantContext } from '@/components/context/TenantContext';
import LoadingState from '@/components/routing/components/LoadingState';

interface SubdomainMiddlewareProps {
  children: React.ReactNode;
}

/**
 * Middleware that ensures subdomain context is preserved across all routes
 */
const SubdomainMiddleware: React.FC<SubdomainMiddlewareProps> = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { setTenantContext, isSubdomainAccess } = useTenantContext();

  useEffect(() => {
    const validateSubdomainContext = async () => {
      try {
        const hostname = window.location.hostname;
        const subdomain = extractSubdomain(hostname);
        
        // Skip validation for development environment
        if (isDevelopmentEnvironment()) {
          setIsValidating(false);
          return;
        }

        // If no subdomain, this is main domain access
        if (!subdomain) {
          setIsValidating(false);
          return;
        }

        // Look up organization by subdomain
        const { data: orgData, error } = await supabase
          .from('organizations')
          .select('id, name, website_enabled')
          .eq('subdomain', subdomain)
          .single();

        if (error || !orgData) {
          console.error('Invalid subdomain:', subdomain);
          // Redirect to main domain if subdomain is invalid
          window.location.href = `${window.location.protocol}//church-os.com/auth`;
          return;
        }

        // Set tenant context
        setTenantContext(orgData.id, orgData.name, true);
        setOrganizationId(orgData.id);

        // Check if current path needs to be updated for subdomain routing
        const currentPath = location.pathname;
        
        // If accessing root or dashboard without organization context, redirect
        if (currentPath === '/' || currentPath === '/dashboard') {
          navigate(`/tenant-dashboard/${orgData.id}`, { replace: true });
        }
        
        // If accessing organization-specific routes, ensure they match the subdomain org
        if (currentPath.includes('/tenant-dashboard/')) {
          const pathOrgId = currentPath.split('/tenant-dashboard/')[1]?.split('/')[0];
          if (pathOrgId && pathOrgId !== orgData.id) {
            // Redirect to correct organization path
            const newPath = currentPath.replace(`/tenant-dashboard/${pathOrgId}`, `/tenant-dashboard/${orgData.id}`);
            navigate(newPath, { replace: true });
          }
        }

      } catch (error) {
        console.error('Error validating subdomain context:', error);
      } finally {
        setIsValidating(false);
      }
    };

    validateSubdomainContext();
  }, [location.pathname, navigate, setTenantContext]);

  if (isValidating) {
    return <LoadingState message="Validating tenant context..." />;
  }

  return <>{children}</>;
};

export default SubdomainMiddleware;
