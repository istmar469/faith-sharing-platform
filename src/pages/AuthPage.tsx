
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AuthForm from '@/components/auth/AuthForm';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Get the redirect URL from query parameters or default to dashboard
  const getRedirectUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('redirect') || '/dashboard';
  };
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (data.session) {
          console.info("User already logged in, redirecting to requested page");
          // Use replace instead of navigate to prevent back button issues
          navigate(getRedirectUrl(), { replace: true });
        }
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, [navigate, location.search]);
  
  // Handle successful login
  const handleLoginSuccess = () => {
    navigate(getRedirectUrl(), { replace: true });
  };
  
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/80 to-primary-dark">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-white mb-4" />
          <p className="text-white font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/80 to-primary-dark">
      <header className="fixed w-full bg-transparent z-50">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-white" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
              <span className="text-accent">Church</span>OS
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              className="text-white hover:text-accent hover:bg-white/10"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-40 pb-20 px-4 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold">Church-OS</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm onSuccess={handleLoginSuccess} />
          </CardContent>
        </Card>
      </main>

      <footer className="bg-gray-900 text-white px-4 py-8">
        <div className="container mx-auto text-center">
          <p className="text-gray-400">© 2025 Church-OS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;
