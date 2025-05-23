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
 * SINGLE SOURCE OF TRUTH for subdomain context management
 */
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
        
        console.log("SubdomainMiddleware: SINGLE CONTEXT MANAGER", { 
          hostname, 
          subdomain, 
          isSubdomainAccess,
          currentPath: location.pathname,
          organizationId
        });

        // If no subdomain, this is main domain access
        if (!subdomain) {
          console.log("SubdomainMiddleware: Main domain access confirmed");
          setIsValidating(false);
          return;
        }

        // Look up organization by subdomain
        console.log("SubdomainMiddleware: Looking up organization for subdomain:", subdomain);
        const { data: orgData, error } = await supabase
          .from('organizations')
          .select('id, name, website_enabled')
          .eq('subdomain', subdomain)
          .single();

        if (error || !orgData) {
          console.error('SubdomainMiddleware: Invalid subdomain:', subdomain, error);
          // Redirect to main domain if subdomain is invalid
          window.location.href = `${window.location.protocol}//church-os.com/auth`;
          return;
        }

        console.log("SubdomainMiddleware: Setting tenant context for subdomain:", orgData);
        
        // Set tenant context - FORCE isSubdomainAccess to true
        setTenantContext(orgData.id, orgData.name, true);

        // CRITICAL: Clean up any path-based routes immediately
        const currentPath = location.pathname;
        if (currentPath.includes('/tenant-dashboard/')) {
          console.log("SubdomainMiddleware: FIXING path-based route on subdomain");
          
          // Extract the actual path after organization ID
          const pathParts = currentPath.split('/tenant-dashboard/')[1];
          if (pathParts) {
            const segments = pathParts.split('/');
            if (segments.length > 1) {
              // Remove org ID, keep the rest
              segments.shift();
              const cleanPath = '/' + segments.join('/');
              console.log("SubdomainMiddleware: Redirecting to clean path:", cleanPath);
              navigate(cleanPath, { replace: true });
            } else {
              // Just org ID, go to root
              navigate('/', { replace: true });
            }
          }
        }

      } catch (error) {
        console.error('SubdomainMiddleware: Error in context validation:', error);
      } finally {
        setIsValidating(false);
      }
    };

    validateAndSetSubdomainContext();
  }, [location.pathname, setTenantContext, navigate]); // Only run when pathname changes

  if (isValidating) {
    return <LoadingState message="Setting up organization context..." />;
  }

  return <>{children}</>;
};

export default SubdomainMiddleware;
