
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface UseAuthStatusReturn {
  isAuthenticated: boolean;
  isUserChecked: boolean;
  isCheckingAuth: boolean;
  retryCount: number;
  handleRetry: () => void;
  handleAuthRetry: () => Promise<void>;
  handleSignOut: () => Promise<void>;
}

export const useAuthStatus = (): UseAuthStatusReturn => {
  const [isUserChecked, setIsUserChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsCheckingAuth(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        const isAuth = !!data.session;
        setIsAuthenticated(isAuth);
        console.log("Auth check result:", isAuth, data.session?.user?.email);
        setIsUserChecked(true);
        setIsCheckingAuth(false);
      } catch (err) {
        console.error("Unexpected error during auth check:", err);
        setIsAuthenticated(false);
        setIsUserChecked(true);
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in useAuthStatus:", event);
      setIsAuthenticated(!!session);
      
      // Reset retry count on auth state change
      if (event === 'SIGNED_IN') {
        setRetryCount(0);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [retryCount]);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    toast({
      title: "Retrying",
      description: "Attempting to reconnect to server..."
    });
  }, [toast]);

  const handleAuthRetry = useCallback(async () => {
    try {
      // Try to refresh the session
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Failed to refresh session:", error);
        // If refresh fails, navigate to auth page
        navigate('/auth');
        return;
      }
      
      // If refresh succeeds, retry
      handleRetry();
    } catch (err) {
      console.error("Session refresh error:", err);
      navigate('/auth');
    }
  }, [handleRetry, navigate]);
  
  const handleSignOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully."
      });
      navigate('/auth');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  }, [navigate, toast]);

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
