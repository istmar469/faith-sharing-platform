
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TenantContextErrorProps {
  error: string;
  onRetry: () => void;
}

const TenantContextError: React.FC<TenantContextErrorProps> = ({ error, onRetry }) => {
  const handleGoToMain = () => {
    window.location.href = 'https://church-os.com';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Organization Not Found</AlertTitle>
          <AlertDescription className="mt-2">
            {error}
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col space-y-3">
          <Button onClick={onRetry} variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          
          <Button onClick={handleGoToMain} className="w-full">
            <Home className="h-4 w-4 mr-2" />
            Go to Church-OS Home
          </Button>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>If you believe this is an error, please contact support.</p>
        </div>
      </div>
    </div>
  );
};

export default TenantContextError;
