
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Info, Database, RefreshCcw, ArrowLeft } from 'lucide-react';
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

  // Check if the error is likely related to a non-existent organization
  const isOrgNotFoundError = error.includes('No organization exists with ID');
  const orgId = isOrgNotFoundError && debugInfo?.subdomain ? debugInfo.subdomain : null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Alert variant="destructive" className="max-w-md mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Website Error</AlertTitle>
        <AlertDescription className="text-center font-medium">
          {error}
        </AlertDescription>
      </Alert>
      
      {isOrgNotFoundError && (
        <div className="max-w-md mb-4">
          <Alert variant="warning" className="mb-4">
            <Database className="h-4 w-4" />
            <AlertTitle>Organization Not Found</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                The organization with ID <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">{orgId}</span> does not exist in the database.
              </p>
              <p className="text-sm text-gray-600">
                This could be due to:
              </p>
              <ul className="text-sm text-gray-600 list-disc pl-5 mt-1 space-y-1">
                <li>The organization has been deleted</li>
                <li>The organization ID is incorrect</li>
                <li>A database connection issue</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      )}
      
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
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
          
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="px-4 py-2"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
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
