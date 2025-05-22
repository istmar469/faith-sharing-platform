
import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/components/auth/AuthContext';

export const useAuthStatus = () => {
  const [isUserChecked, setIsUserChecked] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState<number>(0);
  const auth = useAuthContext();
  
  // Extract auth state
  const isAuthenticated = auth.isAuthenticated;
  
  // Handle retry
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setIsCheckingAuth(true);
  }, []);

  // Handle auth retry
  const handleAuthRetry = useCallback(() => {
    auth.refreshSession().then(() => {
      setRetryCount(prev => prev + 1);
      setIsCheckingAuth(true);
    });
  }, [auth]);
  
  // Modified to ensure Promise<void> return type
  const handleSignOut = useCallback((): Promise<void> => {
    return auth.signOut();
  }, [auth]);
  
  // Effect to check user auth status
  useEffect(() => {
    if (isCheckingAuth) {
      // Simple timeout to simulate checking
      const timer = setTimeout(() => {
        setIsUserChecked(isAuthenticated);
        setIsCheckingAuth(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isCheckingAuth, isAuthenticated, retryCount]);
  
  return {
    isAuthenticated,
    isUserChecked,
    isCheckingAuth,
    handleRetry,
    handleAuthRetry,
    handleSignOut,
    retryCount
  };
};
