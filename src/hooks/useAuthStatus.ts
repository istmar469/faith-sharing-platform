
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (hasInitialized.current) return;
    hasInitialized.current = true;

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

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        setIsAuthenticated(!!session);
        setIsUserChecked(true);
        setIsCheckingAuth(false);
      }
    );

    checkAuth();

    return () => subscription.unsubscribe();
  }, []); // Remove retryCount dependency to prevent loops

  const handleRetry = () => {
    hasInitialized.current = false;
    setRetryCount(prev => prev + 1);
  };
  
  const handleAuthRetry = () => {
    hasInitialized.current = false;
    setRetryCount(prev => prev + 1);
  };

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
