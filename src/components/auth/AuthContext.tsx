
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, AuthState } from '@/hooks/useAuth';

// Create an interface that extends AuthState with the methods from useAuth
interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: any }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: any }>;
  signOut: () => Promise<void>;
  getJWT: () => string | null;
  refreshSession: () => Promise<{ success: boolean; data?: any; error?: any }>;
}

// Create context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
