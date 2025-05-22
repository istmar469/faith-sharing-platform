
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/AuthContext';

interface AuthStatusReturn {
  isAuthenticated: boolean;
  isUserChecked: boolean;
  isCheckingAuth: boolean;
  handleRetry: () => void;
  handleAuthRetry: () => void;
  handleSignOut: () => Promise<void>; // Explicitly typed as returning Promise<void>
  retryCount: number;
}

export function useAuthStatus(): AuthStatusReturn {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUserChecked, setIsUserChecked] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const auth = useAuthContext();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (!error && data.session) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
        setIsUserChecked(true);
      }
    };

    checkAuth();
  }, [retryCount]);

  // Handlers for retrying authentication
  const handleRetry = useCallback(() => {
    setIsCheckingAuth(true);
    setRetryCount((prev) => prev + 1);
  }, []);

  const handleAuthRetry = useCallback(() => {
    setIsCheckingAuth(true);
    setIsAuthenticated(false);
    setIsUserChecked(false);
    setRetryCount((prev) => prev + 1);
  }, []);

  // Sign out handler that returns a Promise
  const handleSignOut = useCallback(async (): Promise<void> => {
    try {
      // Use the signOut method from the auth context which returns a Promise
      return await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error; // Rethrow to allow caller to handle
    }
  }, [auth]);

  return {
    isAuthenticated,
    isUserChecked,
    isCheckingAuth,
    handleRetry,
    handleAuthRetry,
    handleSignOut,
    retryCount
  };
}
