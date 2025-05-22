
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../auth/AuthForm';

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
  
  const handleSuccessfulLogin = () => {
    // Refresh the page after successful login
    window.location.reload();
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
              {/* Include the AuthForm directly instead of showing a modal */}
              <AuthForm onSuccess={handleSuccessfulLogin} />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Include the AuthForm directly */}
              <AuthForm onSuccess={handleSuccessfulLogin} />
              
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
              
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
