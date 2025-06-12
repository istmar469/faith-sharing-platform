import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isSuperAdmin } from '@/utils/superAdminCheck';

export interface UseMainDomainRedirectProps {
  isSubdomainAccess: boolean;
  isAuthenticated: boolean;
  isContextReady: boolean;
  setShouldRedirect: (redirect: boolean) => void;
}

export const useMainDomainRedirect = ({
  isSubdomainAccess,
  isAuthenticated,
  isContextReady,
  setShouldRedirect
}: UseMainDomainRedirectProps) => {
  useEffect(() => {
    const checkRedirectForMainDomain = async () => {
      // Only check for redirect on main domain and when user is authenticated
      if (!isSubdomainAccess && isAuthenticated && isContextReady) {
        try {
          // Use unified super admin check
          const isSuperAdminData = await isSuperAdmin();
          const { data: userOrgs } = await supabase.rpc('rbac_fetch_user_organizations');
          
          // If user has orgs or is super admin, they should probably be redirected to dashboard
          if (isSuperAdminData || (userOrgs && userOrgs.length > 0)) {
            console.log('Index: Authenticated user on main domain with orgs/admin access, considering redirect');
            setShouldRedirect(true);
          }
        } catch (error) {
          console.error('Index: Error checking user status:', error);
        }
      }
    };

    checkRedirectForMainDomain();
  }, [isSubdomainAccess, isAuthenticated, isContextReady, setShouldRedirect]);
};
