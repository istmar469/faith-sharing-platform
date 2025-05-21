
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import DebugPanel from './DebugPanel';

interface ErrorStateProps {
  error: string;
  orgData?: any;
  debugInfo?: any;
}

const ErrorState = ({ error, orgData, debugInfo }: ErrorStateProps) => {
  const navigate = useNavigate();
  const [showDebug, setShowDebug] = useState(false);
  
  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <Alert variant="destructive" className="max-w-md mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Website Error</AlertTitle>
        <AlertDescription className="text-center font-medium">
          {error}
        </AlertDescription>
      </Alert>
      
      {orgData && (
        <div className="max-w-md mb-6">
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Organization Details</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {orgData.name}</p>
                <p><span className="font-medium">Subdomain:</span> {orgData.subdomain || 'Not set'}</p>
                <p><span className="font-medium">Website Enabled:</span> {orgData.website_enabled ? 'Yes' : 'No'}</p>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <div className="flex flex-col gap-3 mt-4">
        <div className="flex gap-3">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2"
          >
            Go to Dashboard
          </Button>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="px-4 py-2"
          >
            Try Again
          </Button>
        </div>
        
        {debugInfo && (
          <Button 
            onClick={toggleDebug} 
            variant="secondary"
            size="sm"
          >
            {showDebug ? "Hide Debug Info" : "Show Debug Info"}
          </Button>
        )}
        
        {showDebug && debugInfo && (
          <DebugPanel debugInfo={debugInfo} />
        )}
      </div>
    </div>
  );
};

export default ErrorState;
