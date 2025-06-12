import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Home } from 'lucide-react';
import LoginDialog from '@/components/auth/LoginDialog';

interface LoginPromptProps {
  organizationName?: string | null;
  isMainDomain: boolean;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ organizationName, isMainDomain }) => {
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleGoHome = () => {
    window.location.href = 'https://church-os.com';
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isMainDomain ? 'Church-OS Dashboard' : `${organizationName || 'Organization'} Dashboard`}
            </CardTitle>
            <CardDescription>
              {isMainDomain 
                ? 'Please sign in to access the admin dashboard'
                : `Please sign in to access ${organizationName || 'this organization'}'s dashboard`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setShowLoginDialog(true)} 
              className="w-full"
              size="lg"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
            
            {!isMainDomain && (
              <Button 
                variant="outline" 
                onClick={handleGoHome}
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Main Site
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
      
      <LoginDialog 
        isOpen={showLoginDialog} 
        setIsOpen={(open) => {
          setShowLoginDialog(open);
          // Don't reload - let auth state change naturally
        }} 
      />
    </>
  );
};

export default LoginPrompt; 