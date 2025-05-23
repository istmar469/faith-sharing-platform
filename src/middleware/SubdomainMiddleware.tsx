
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
        const currentPath = location.pathname;

        console.log("SubdomainMiddleware: Processing hostname:", hostname, "subdomain:", subdomain, "path:", currentPath);

        // EMERGENCY REDIRECT: If we're on a subdomain but have tenant-dashboard in URL, redirect immediately
        if (subdomain && currentPath.includes('/tenant-dashboard/')) {
          console.log("SubdomainMiddleware: Emergency redirect - cleaning tenant-dashboard path");
          const pathParts = currentPath.split('/tenant-dashboard/')[1];
          if (pathParts) {
            const segments = pathParts.split('/');
            if (segments.length > 1) {
              // Remove the org ID and navigate to clean path
              segments.shift();
              const cleanPath = '/' + segments.join('/');
              console.log("SubdomainMiddleware: Redirecting to clean path:", cleanPath);
              navigate(cleanPath, { replace: true });
              return;
            } else {
              navigate('/', { replace: true });
              return;
            }
          }
        }

        // If no subdomain detected, we're on main domain
        if (!subdomain) {
          console.log("SubdomainMiddleware: No subdomain detected, main domain access");
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
          console.error("SubdomainMiddleware: Invalid subdomain:", subdomain);
          // Redirect to main site if org not found
          window.location.href = `${window.location.protocol}//church-os.com/auth`;
          return;
        }

        console.log("SubdomainMiddleware: Found organization:", orgData.id, orgData.name);

        // Set tenant context with subdomain flag - this should be the ONLY place setting isSubdomain: true
        setTenantContext(orgData.id, orgData.name, true);

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
