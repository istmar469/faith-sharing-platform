
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
  
  useEffect(() => {
    console.log("=== AuthenticationCheck: Starting fresh authentication check ===");
    
    const checkAuth = async () => {
      try {
        // Force a fresh session check
        console.log("AuthenticationCheck: Getting fresh session...");
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("AuthenticationCheck: Session error:", sessionError);
          setLoginDialogOpen(true);
          onNotAuthenticated();
          return;
        }
        
        if (!sessionData.session || !sessionData.session.user) {
          console.log("AuthenticationCheck: No valid session found, showing login");
          setLoginDialogOpen(true);
          onNotAuthenticated();
          return;
        }
        
        const user = sessionData.session.user;
        console.log("AuthenticationCheck: Valid session found for user:", user.id);
        
        // Verify the user still exists and has proper access
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          console.error("AuthenticationCheck: User verification failed:", userError);
          setLoginDialogOpen(true);
          onNotAuthenticated();
          return;
        }
        
        console.log("AuthenticationCheck: User verified successfully:", userData.user.id);
        onAuthenticated(userData.user.id);
      } catch (err) {
        console.error("AuthenticationCheck: Unexpected error:", err);
        setLoginDialogOpen(true);
        onNotAuthenticated();
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
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
          <p className="text-lg font-medium">Verifying authentication...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthenticationCheck;
