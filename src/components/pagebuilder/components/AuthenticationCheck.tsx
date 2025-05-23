
import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import LoginDialog from '../../auth/LoginDialog';

interface AuthenticationCheckProps {
  onAuthenticated: (userId: string) => void;
  onNotAuthenticated: () => void;
  children: React.ReactNode;
}

const AuthenticationCheck: React.FC<AuthenticationCheckProps> = ({ 
  onAuthenticated, 
  onNotAuthenticated,
  children 
}) => {
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authTimeout, setAuthTimeout] = useState<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    console.log("=== AuthenticationCheck: Starting authentication check ===");
    
    // Set a timeout to prevent hanging on auth check - reduced to 3 seconds
    const timeout = setTimeout(() => {
      if (isCheckingAuth) {
        console.error("AuthenticationCheck: Authentication check timed out after 3 seconds");
        setIsCheckingAuth(false);
        setLoginDialogOpen(true);
        onNotAuthenticated();
      }
    }, 3000); // Reduced from 10 seconds to 3 seconds
    
    setAuthTimeout(timeout);
    
    const checkAuth = async () => {
      try {
        console.log("AuthenticationCheck: Getting current user...");
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("AuthenticationCheck: Error getting user:", error);
          setLoginDialogOpen(true);
          onNotAuthenticated();
          return;
        }
        
        if (!data.user) {
          console.log("AuthenticationCheck: No user found, showing login dialog");
          setLoginDialogOpen(true);
          onNotAuthenticated();
          return;
        }
        
        console.log("AuthenticationCheck: User authenticated successfully:", data.user.id);
        onAuthenticated(data.user.id);
      } catch (err) {
        console.error("AuthenticationCheck: Unexpected error in authentication check:", err);
        setLoginDialogOpen(true);
        onNotAuthenticated();
      } finally {
        setIsCheckingAuth(false);
        if (authTimeout) clearTimeout(authTimeout);
      }
    };
    
    checkAuth();
    
    return () => {
      if (authTimeout) clearTimeout(authTimeout);
    };
  }, [onAuthenticated, onNotAuthenticated]);

  if (loginDialogOpen) {
    return (
      <>
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="text-center max-w-md p-6">
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="mb-4 text-gray-600">
              Please log in to access the page builder.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Retry Authentication
            </button>
          </div>
        </div>
        <LoginDialog 
          isOpen={loginDialogOpen} 
          setIsOpen={(open) => {
            setLoginDialogOpen(open);
            if (!open) {
              window.location.reload();
            }
          }} 
        />
      </>
    );
  }
  
  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-medium">Checking authentication...</p>
          <p className="text-sm text-gray-500 mt-2">This should only take a moment</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthenticationCheck;
