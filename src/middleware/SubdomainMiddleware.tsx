
import React, { useEffect, useState, useRef } from 'react';
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
  const hasValidatedRef = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { setTenantContext, isSubdomainAccess } = useTenantContext();

  useEffect(() => {
    // Only run validation once
    if (hasValidatedRef.current) {
      setIsValidating(false);
      return;
    }

    const validateAndSetSubdomainContext = async () => {
      try {
        const hostname = window.location.hostname;
        const subdomain = extractSubdomain(hostname);

        // If no subdomain detected, we're done
        if (!subdomain) {
          hasValidatedRef.current = true;
          setIsValidating(false);
          return;
        }

        // Lookup organization by subdomain
        const { data: orgData, error } = await supabase
          .from('organizations')
          .select('id, name, website_enabled')
          .eq('subdomain', subdomain)
          .single();

        if (error || !orgData) {
          // Redirect to main site if org not found
          window.location.href = `${window.location.protocol}//church-os.com/auth`;
          return;
        }

        // Set tenant context with subdomain flag
        setTenantContext(orgData.id, orgData.name, true);

        // Clean up URL for subdomain access - remove tenant-dashboard prefix
        const currentPath = location.pathname;
        if (currentPath.includes('/tenant-dashboard/')) {
          const pathParts = currentPath.split('/tenant-dashboard/')[1];
          if (pathParts) {
            const segments = pathParts.split('/');
            if (segments.length > 1) {
              // Remove the org ID and navigate to clean path
              segments.shift();
              const cleanPath = '/' + segments.join('/');
              navigate(cleanPath, { replace: true });
            } else {
              navigate('/', { replace: true });
            }
          }
        }

        hasValidatedRef.current = true;
      } catch (error) {
        console.error('SubdomainMiddleware error:', error);
        hasValidatedRef.current = true;
      } finally {
        setIsValidating(false);
      }
    };

    validateAndSetSubdomainContext();
  }, []); // Empty dependency array - only run once

  if (isValidating) {
    return <LoadingState message="Setting up organization context..." />;
  }

  return <>{children}</>;
};

export default SubdomainMiddleware;
