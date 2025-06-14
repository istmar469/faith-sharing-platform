import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { processPendingSubdomainSignup } from '@/services/auth/subdomainSignup';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: any }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<{ success: boolean; data?: any; error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false
  });
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        // Process pending subdomain signup if user just signed in/up
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          await processPendingSubdomainSignup(session.user);
        }
        
        setAuthState({
          user: session?.user || null,
          session: session,
          isLoading: false,
          isAuthenticated: !!session
        });
      }
    );

    // Then check current session
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setAuthState(prev => ({ ...prev, isLoading: false }));
          return;
        }
        
        setAuthState({
          user: data.session?.user || null,
          session: data.session,
          isLoading: false,
          isAuthenticated: !!data.session
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    initializeAuth();
    
    return () => subscription.unsubscribe();
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
      
      // Provide specific error messages based on error type
      let errorMessage = "Please check your credentials and try again";
      let errorTitle = "Sign in failed";
      
      if (error.message?.toLowerCase().includes('invalid login credentials')) {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
        errorTitle = "Invalid credentials";
      } else if (error.message?.toLowerCase().includes('email not confirmed')) {
        errorMessage = "Please check your email and click the confirmation link before signing in.";
        errorTitle = "Email not confirmed";
      } else if (error.message?.toLowerCase().includes('too many requests')) {
        errorMessage = "Too many login attempts. Please wait a few minutes before trying again.";
        errorTitle = "Rate limited";
      } else if (error.message?.toLowerCase().includes('network')) {
        errorMessage = "Network error. Please check your internet connection and try again.";
        errorTitle = "Connection error";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      
      return { 
        success: false, 
        error: {
          ...error,
          userMessage: errorMessage,
          errorType: error.message?.toLowerCase().includes('invalid login credentials') ? 'INVALID_CREDENTIALS' : 'OTHER'
        }
      };
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
      
      // Provide specific error messages based on error type
      let errorMessage = "Please try again with a different email";
      let errorTitle = "Sign up failed";
      
      if (error.message?.toLowerCase().includes('user already registered')) {
        errorMessage = "An account with this email already exists. Please try signing in instead.";
        errorTitle = "Account exists";
      } else if (error.message?.toLowerCase().includes('password')) {
        errorMessage = "Password must be at least 6 characters long.";
        errorTitle = "Invalid password";
      } else if (error.message?.toLowerCase().includes('email')) {
        errorMessage = "Please enter a valid email address.";
        errorTitle = "Invalid email";
      } else if (error.message?.toLowerCase().includes('too many requests')) {
        errorMessage = "Too many registration attempts. Please wait a few minutes before trying again.";
        errorTitle = "Rate limited";
      } else if (error.message?.toLowerCase().includes('network')) {
        errorMessage = "Network error. Please check your internet connection and try again.";
        errorTitle = "Connection error";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      
      return { 
        success: false, 
        error: {
          ...error,
          userMessage: errorMessage,
          errorType: error.message?.toLowerCase().includes('user already registered') ? 'USER_EXISTS' : 'OTHER'
        }
      };
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
    } catch (error: any) {
      console.error('Sign out error:', error);
      
      toast({
        title: "Sign out failed",
        description: error.message || "An error occurred while signing out",
        variant: "destructive",
      });
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Session refresh error:', error);
      return { success: false, error };
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
    refreshSession
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
