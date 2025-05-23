
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface PageLoadErrorProps {
  error: string;
  organizationId: string | null;
}

const PageLoadError: React.FC<PageLoadErrorProps> = ({ error, organizationId }) => {
  const navigate = useNavigate();
  
  const handleRetry = () => {
    console.log("PageLoadError: Retrying page load");
    window.location.reload();
  };
  
  const handleGoToDashboard = () => {
    console.log("PageLoadError: Navigating to dashboard");
    navigate('/dashboard');
  };
  
  const handleCreateNewPage = () => {
    if (organizationId) {
      console.log("PageLoadError: Creating new page");
      navigate(`/page-builder/${organizationId}`);
    }
  };
  
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Page Builder</AlertTitle>
          <AlertDescription className="mt-2">
            {error}
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          <Button 
            onClick={handleRetry}
            className="w-full"
            variant="default"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Loading
          </Button>
          
          {organizationId && (
            <Button 
              onClick={handleCreateNewPage}
              className="w-full"
              variant="outline"
            >
              Create New Page Instead
            </Button>
          )}
          
          <Button 
            onClick={handleGoToDashboard}
            className="w-full"
            variant="secondary"
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>
        
        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>If this issue persists, try:</p>
          <ul className="mt-2 space-y-1">
            <li>• Checking your internet connection</li>
            <li>• Clearing browser cache and cookies</li>
            <li>• Trying in an incognito/private window</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PageLoadError;
