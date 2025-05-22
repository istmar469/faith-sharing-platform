
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../auth/AuthForm';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AccessDeniedProps {
  onLoginClick?: () => void;
  message?: string;
  isAuthError?: boolean;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ 
  onLoginClick,
  message = "You don't have permission to access this page",
  isAuthError = false
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  
  const handleSuccessfulLogin = async () => {
    console.log("Login successful in AccessDenied");
    setProcessing(true);
    
    try {
      // Force reload the dashboard to ensure all auth state is updated properly
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error("Error navigating after login:", error);
      toast({
        title: "Navigation Error",
        description: "There was a problem redirecting you. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };
  
  const handleSignOut = async () => {
    setProcessing(true);
    
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed Out",
        description: "You have been signed out. Please sign in again."
      });
      
      // Navigate to auth page
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign Out Error",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-primary-dark p-4 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            {isAuthError ? (
              <Shield className="h-12 w-12 text-amber-500" />
            ) : (
              <AlertTriangle className="h-12 w-12 text-amber-500" />
            )}
          </div>
          <CardTitle className="text-3xl font-bold">Access Denied</CardTitle>
          <CardDescription className="pt-2">{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {isAuthError ? (
            <div className="space-y-4">
              <AuthForm onSuccess={handleSuccessfulLogin} />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-sm text-gray-500 mb-4">
                You are signed in but do not have the required permissions.
              </p>
              
              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={handleSignOut}
                  disabled={processing}
                  className="w-full"
                >
                  Sign Out and Try Another Account
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleBackToHome}
                  disabled={processing}
                >
                  Back to Home
                </Button>
              </div>
              
              <div className="text-center text-sm text-gray-500 mt-6">
                <p>If you believe this is an error, please contact your administrator</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDenied;
