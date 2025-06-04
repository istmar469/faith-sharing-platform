import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ErrorFallbackProps {
  error: string;
  showHomeButton?: boolean;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, showHomeButton = true }) => {
  const handleGoHome = () => {
    window.location.href = 'https://church-os.com';
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = 'https://church-os.com';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-600">Access Error</CardTitle>
          <CardDescription className="text-gray-600">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={handleRefresh} 
            className="w-full"
            variant="default"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          
          {showHomeButton && (
            <Button 
              variant="outline" 
              onClick={handleGoHome}
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Main Site
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="w-full text-gray-600"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorFallback; 