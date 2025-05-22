
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthCheck = () => {
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkUserAuth = async () => {
      setIsCheckingAuth(true);
      
      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data.user) {
        console.log("User not authenticated, showing login dialog");
        setLoginDialogOpen(true);
      }
      
      setIsCheckingAuth(false);
    };
    
    checkUserAuth();
  }, []);

  return {
    loginDialogOpen,
    setLoginDialogOpen,
    isCheckingAuth
  };
};
