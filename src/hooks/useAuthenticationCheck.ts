
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface AuthCheckResult {
  loginDialogOpen: boolean;
  setLoginDialogOpen: (open: boolean) => void;
  checkAuthentication: (pathname: string, orgData?: any) => Promise<boolean>;
}

export const useAuthenticationCheck = (): AuthCheckResult => {
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const checkAuthentication = async (pathname: string, orgData?: any): Promise<boolean> => {
    const { data: sessionData } = await supabase.auth.getSession();
    const isAuthRequiredPath = isAuthenticationRequiredPath(pathname);
    
    if (!sessionData.session && isAuthRequiredPath) {
      setLoginDialogOpen(true);
      return false;
    }

    return true;
  };

  const isAuthenticationRequiredPath = (pathname: string): boolean => {
    const authRequiredPaths = [
      '/dashboard',
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
