
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
  handleSignOut: () => Promise<void>; // Ensure this returns a Promise<void>
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
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!error) {
          setIsAuthenticated(!!session);
        }
        setIsUserChecked(true);
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [retryCount]);

  const handleRetry = () => setRetryCount(prev => prev + 1);
  const handleAuthRetry = () => setRetryCount(prev => prev + 1);

  // Ensure this returns a Promise
  const handleSignOut = useCallback(async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out failed:', error.message);
      } else {
        navigate('/auth', { replace: true });
      }
    } catch (err) {
      console.error('Sign out error:', err);
    }
    // Explicitly return a resolved Promise
    return Promise.resolve();
  }, [navigate]);

  return {
    isAuthenticated,
    isUserChecked,
    isCheckingAuth,
    retryCount,
    handleRetry,
    handleAuthRetry,
    handleSignOut
  };
};
