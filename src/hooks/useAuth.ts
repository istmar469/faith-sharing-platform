import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { Session, User } from '@supabase/supabase-js';

export interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    isLoading: true,
    isAuthenticated: false,
    accessToken: null,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        
        // Update auth state
        setAuthState({
          session,
          user: session?.user ?? null,
          isLoading: false,
          isAuthenticated: !!session,
          accessToken: session?.access_token ?? null,
        });
        
        // Handle events that require special treatment
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        }
      }
    );
    
    // Then check the current session
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setAuthState(state => ({ ...state, isLoading: false }));
          return;
        }
        
        setAuthState({
          session: data.session,
          user: data.session?.user ?? null,
          isLoading: false,
          isAuthenticated: !!data.session,
          accessToken: data.session?.access_token ?? null,
        });
      } catch (error) {
        console.error('Unexpected error during auth initialization:', error);
        setAuthState(state => ({ ...state, isLoading: false }));
      }
    };
    
    initializeAuth();
    
    // Clean up the subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      });
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      toast({
        title: "Sign in failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
      
      return { success: false, error };
    }
  };
  
  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created",
        description: "Please check your email to confirm your account",
      });
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      toast({
        title: "Sign up failed",
        description: error.message || "Please try again with a different email",
        variant: "destructive",
      });
      
      return { success: false, error };
    }
  };
  

  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
      
      navigate('/auth', { replace: true });
    } catch (error: any) {
      console.error('Sign out error:', error);
      
      toast({
        title: "Sign out failed",
        description: error.message || "An error occurred while signing out",
        variant: "destructive",
      });
    }
  };
  
  const getJWT = (): string | null => {
    return authState.accessToken;
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    getJWT,
    refreshSession: async () => {
      const { data, error } = await supabase.auth.refreshSession();
      if (!error) {
        setAuthState({
          session: data.session,
          user: data.session?.user ?? null,
          isLoading: false,
          isAuthenticated: !!data.session,
          accessToken: data.session?.access_token ?? null,
        });
        return { success: true, data };
      }
      return { success: false, error };
    }
  };
}
