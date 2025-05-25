
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTenantContext } from './TenantContext';
import { extractSubdomain, isDevelopmentEnvironment, getOrganizationIdFromPath } from '@/utils/domain';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TenantContextValidatorProps {
  children: React.ReactNode;
}

/**
 * Validates that the tenant context matches the current subdomain/route
 */
const TenantContextValidator: React.FC<TenantContextValidatorProps> = ({ children }) => {
  const { organizationId, setTenantContext, isSubdomainAccess } = useTenantContext();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const validateContext = async () => {
      try {
        const hostname = window.location.hostname;
        const subdomain = extractSubdomain(hostname);
        const pathOrgId = getOrganizationIdFromPath(location.pathname);

        // Skip validation for development environment without subdomain
        if (isDevelopmentEnvironment() && !subdomain) {
          return;
        }

        // If we have a subdomain, validate it matches our context
        if (subdomain && !isDevelopmentEnvironment()) {
          const { data: orgData, error } = await supabase
            .from('organizations')
            .select('id, name')
            .eq('subdomain', subdomain)
            .single();

          if (error || !orgData) {
            console.error('Invalid subdomain in context validator:', subdomain);
            toast({
              title: "Invalid Domain",
              description: "This subdomain is not registered.",
              variant: "destructive"
            });
            return;
          }

          // If organization context doesn't match subdomain, update it
          if (organizationId !== orgData.id) {
            console.log('Updating context to match subdomain:', orgData.id);
            setTenantContext(orgData.id, orgData.name, true);
          }

          // If URL has different org ID than subdomain, that's a mismatch
          if (pathOrgId && pathOrgId !== orgData.id) {
            console.error('Path organization ID does not match subdomain organization');
            toast({
              title: "Access Error",
              description: "URL does not match your organization context.",
              variant: "destructive"
            });
          }
        }

        // For non-subdomain access, ensure context matches URL if available
        if (!isSubdomainAccess && pathOrgId && organizationId !== pathOrgId) {
          console.log('Updating context to match URL organization:', pathOrgId);
          // Fetch organization name for context
          const { data: orgData } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', pathOrgId)
            .single();
          
          setTenantContext(pathOrgId, orgData?.name || null, false);
        }

      } catch (error) {
        console.error('Error validating tenant context:', error);
      }
    };

    validateContext();
  }, [location.pathname, organizationId, setTenantContext, isSubdomainAccess, toast]);

  return <>{children}</>;
};

export default TenantContextValidator;
