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
  const location = useLocation();
  const navigate = useNavigate();
  const { setTenantContext, isSubdomainAccess, organizationId } = useTenantContext();

  useEffect(() => {
    const validateSubdomainContext = async () => {
      try {
        const hostname = window.location.hostname;
        const subdomain = extractSubdomain(hostname);
        
        console.log("SubdomainMiddleware: Validating context", { 
          hostname, 
          subdomain, 
          isSubdomainAccess,
          currentPath: location.pathname,
          organizationId
        });

        // If no subdomain, this is main domain access
        if (!subdomain) {
          console.log("SubdomainMiddleware: Main domain access");
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

        // Clean up any path-based routes - this is critical
        const currentPath = location.pathname;
        if (currentPath.includes('/tenant-dashboard/')) {
          console.log("SubdomainMiddleware: Redirecting from path-based to subdomain route");
          // Extract just the path part after the organization ID
          const parts = currentPath.split('/tenant-dashboard/')[1]?.split('/');
          if (parts && parts.length > 1) {
            // Remove the organization ID and keep the rest
            parts.shift(); // Remove org ID
            const cleanPath = '/' + parts.join('/');
            navigate(cleanPath, { replace: true });
          } else {
            // Default to dashboard
            navigate('/', { replace: true });
          }
        }

      } catch (error) {
        console.error('SubdomainMiddleware: Error validating subdomain context:', error);
      } finally {
        setIsValidating(false);
      }
    };

    validateSubdomainContext();
  }, [location.pathname]); // Run when pathname changes to ensure cleanup

  if (isValidating) {
    return <LoadingState message="Validating tenant context..." />;
  }

  return <>{children}</>;
};

export default SubdomainMiddleware;
