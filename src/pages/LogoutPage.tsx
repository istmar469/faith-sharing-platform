import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const LogoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(true);

  useEffect(() => {
    const performLogout = async () => {
      try {
        await supabase.auth.signOut();
        // Give a moment for the auth state to update
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
      } catch (error) {
        console.error('Error during logout:', error);
        // Still redirect even if there's an error
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
      } finally {
        setIsLoggingOut(false);
      }
    };

    performLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md p-6">
        {isLoggingOut ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Signing out...</h1>
            <p className="text-gray-600">Please wait while we log you out</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Logged out successfully</h1>
            <p className="text-gray-600 mb-4">You have been logged out. Redirecting to home page...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default LogoutPage;
