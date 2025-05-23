
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
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        const { data, error } = await supabase.auth.getUser();
        
        if (error || !data.user) {
          console.error("User not authenticated. Showing login dialog.");
          setLoginDialogOpen(true);
          onNotAuthenticated();
          return;
        }
        
        onAuthenticated(data.user.id);
      } catch (err) {
        console.error("Error in authentication check:", err);
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
    return null;
  }

  return <>{children}</>;
};

export default AuthenticationCheck;
