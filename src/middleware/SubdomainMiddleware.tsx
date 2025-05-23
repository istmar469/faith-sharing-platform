
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { extractSubdomain } from '@/utils/domainUtils';
import { useTenantContext } from '@/components/context/TenantContext';
import LoadingState from '@/components/routing/components/LoadingState';

interface SubdomainMiddlewareProps {
  children: React.ReactNode;
}

const SubdomainMiddleware: React.FC<SubdomainMiddlewareProps> = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { setTenantContext, isSubdomainAccess, organizationId } = useTenantContext();

  useEffect(() => {
    const validateAndSetSubdomainContext = async () => {
      try {
        const hostname = window.location.hostname;
        const subdomain = extractSubdomain(hostname);

        if (!subdomain) {
          setIsValidating(false);
          return;
        }

        const { data: orgData, error } = await supabase
          .from('organizations')
          .select('id, name, website_enabled')
          .eq('subdomain', subdomain)
          .single();

        if (error || !orgData) {
          window.location.href = `${window.location.protocol}//church-os.com/auth`;
          return;
        }

        setTenantContext(orgData.id, orgData.name, true);

        const currentPath = location.pathname;
        if (currentPath.includes('/tenant-dashboard/')) {
          const pathParts = currentPath.split('/tenant-dashboard/')[1];
          if (pathParts) {
            const segments = pathParts.split('/');
            if (segments.length > 1) {
              segments.shift();
              const cleanPath = '/' + segments.join('/');
              navigate(cleanPath, { replace: true });
            } else {
              navigate('/', { replace: true });
            }
          }
        }

      } catch (error) {
        // Silent error handling
      } finally {
        setIsValidating(false);
      }
    };

    validateAndSetSubdomainContext();
  }, [location.pathname, setTenantContext, navigate]);

  if (isValidating) {
    return <LoadingState message="Setting up organization context..." />;
  }

  return <>{children}</>;
};

export default SubdomainMiddleware;
