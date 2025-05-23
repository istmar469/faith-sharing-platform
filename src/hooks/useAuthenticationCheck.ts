
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useViewMode } from "@/components/context/ViewModeContext";

interface AuthCheckResult {
  loginDialogOpen: boolean;
  setLoginDialogOpen: (open: boolean) => void;
  checkAuthentication: (pathname: string, orgData?: any) => Promise<boolean>;
}

export const useAuthenticationCheck = (): AuthCheckResult => {
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const { setViewMode } = useViewMode();

  const checkAuthentication = async (pathname: string, orgData?: any): Promise<boolean> => {
    const { data: sessionData } = await supabase.auth.getSession();
    const isAuthRequiredPath = isAuthenticationRequiredPath(pathname);
    
    if (!sessionData.session && isAuthRequiredPath) {
      console.log("No user session found, showing login dialog for protected path");
      setLoginDialogOpen(true);
      return false;
    }

    if (sessionData.session && orgData) {
      // Check if user is a super admin but RESPECT subdomain context
      const { data: isSuperAdminData } = await supabase.rpc('direct_super_admin_check');
      if (isSuperAdminData) {
        console.log("Super admin on subdomain - setting regular_admin mode to respect context");
        setViewMode('regular_admin'); // Don't force them out of subdomain context
      }
    }

    return true;
  };

  const isAuthenticationRequiredPath = (pathname: string): boolean => {
    const authRequiredPaths = [
      '/tenant-dashboard/',
      '/settings/',
      '/admin/',
      '/page-builder/'
    ];
    
    return authRequiredPaths.some(path => pathname.startsWith(path));
  };

  return {
    loginDialogOpen,
    setLoginDialogOpen,
    checkAuthentication
  };
};
