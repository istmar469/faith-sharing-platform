
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export interface AuthStatusReturn {
  isAuthenticated: boolean;
  isUserChecked: boolean;
  isCheckingAuth: boolean;
  retryCount: number;
  handleRetry: () => void;
  handleAuthRetry: () => void;
  handleSignOut: () => Promise<void>;
}

export const useAuthStatus = (): AuthStatusReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUserChecked, setIsUserChecked] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error checking session:', error.message);
      }

      setIsAuthenticated(!!session);
      setIsUserChecked(true);
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [retryCount]);

  const handleRetry = () => setRetryCount(prev => prev + 1);
  const handleAuthRetry = () => setRetryCount(prev => prev + 1);

  // Fix: Ensure handleSignOut properly returns a Promise<void>
  const handleSignOut = useCallback(async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error.message);
    } else {
      navigate('/auth', { replace: true });
    }
  }, [navigate]);

  return {
    isAuthenticated,
    isUserChecked,
    isCheckingAuth,
    retryCount,
    handleRetry,
    handleAuthRetry,
    handleSignOut,
  };
};
