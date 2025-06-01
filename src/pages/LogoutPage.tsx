import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        console.log('LogoutPage: Attempting to sign out...');
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        console.log('LogoutPage: Sign out successful, redirecting to landing page');
        // Clear any cached data
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirect to landing page
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Logout error:', error);
        // Even if there's an error, try to redirect
        navigate('/', { replace: true });
      }
    };

    handleLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Signing you out...</h2>
        <p className="text-gray-600">Please wait while we log you out.</p>
      </div>
    </div>
  );
};

export default LogoutPage;
