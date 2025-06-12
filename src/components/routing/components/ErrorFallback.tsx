import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/components/context/TenantContext';

interface ErrorFallbackProps {
  error: string;
  showHomeButton?: boolean;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, showHomeButton = false }) => {
  const { organizationName, isSubdomainAccess } = useTenantContext();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = 'https://church-os.com';
  };

  const isAccessDeniedError = error.toLowerCase().includes("don't have permission") || 
                             error.toLowerCase().includes("access");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-xl">
            {isAccessDeniedError && isSubdomainAccess 
              ? 'Organization Access Required' 
              : 'Access Error'
            }
          </CardTitle>
          <CardDescription>
            {isAccessDeniedError && isSubdomainAccess ? (
              <>
                You need to be added as a member of <strong>{organizationName}</strong> to access this dashboard.
                <br /><br />
                Please contact an administrator of {organizationName} to request access, or sign out and try a different account.
              </>
            ) : (
              error
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={handleSignOut} 
            variant="outline"
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
          
          {(showHomeButton || !isSubdomainAccess) && (
            <Button 
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
  );
};

export default ErrorFallback; 