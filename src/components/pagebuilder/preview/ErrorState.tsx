
import React from 'react';
import { AlertTriangle, Database, Home, AlertCircle, Hammer } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from 'react-router-dom';

interface ErrorStateProps {
  error: string;
  orgData?: any;
  debugInfo?: any;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, orgData, debugInfo }) => {
  const navigate = useNavigate();
  const orgId = orgData?.id || debugInfo?.orgData?.id;
  
  const handleDiagnostic = () => {
    navigate('/diagnostic');
  };
  
  const handleReturnHome = () => {
    navigate('/');
  };
  
  const goToDashboard = () => {
    if (orgId) {
      navigate(`/tenant-dashboard/${orgId}`);
    } else {
      navigate('/dashboard');
    }
  };
  
  const checkSubdomain = async () => {
    if (orgData?.subdomain) {
      navigate(`/preview-domain/${orgData.subdomain}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="max-w-lg w-full shadow-md p-6 bg-white">
        <div className="flex flex-col items-center text-center mb-6">
          <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Domain Not Configured</h1>
          <p className="text-gray-600 mt-2">
            The subdomain you're trying to access either
            doesn't exist or hasn't been properly configured.
          </p>
        </div>
        
        <Alert className="bg-blue-50 border-blue-200 mb-4">
          <AlertCircle className="h-4 w-4 text-blue-800" />
          <AlertTitle className="text-blue-800">Current Details</AlertTitle>
          <AlertDescription className="text-blue-700">
            <div className="mt-2">
              {orgData?.subdomain && (
                <div className="flex items-baseline">
                  <span className="font-medium w-32">Subdomain:</span>
                  <code className="bg-blue-100 px-1 rounded">{orgData.subdomain}</code>
                </div>
              )}
              {orgData?.name && (
                <div className="flex items-baseline">
                  <span className="font-medium w-32">Organization:</span>
                  <span>{orgData.name}</span>
                </div>
              )}
              <div className="flex items-baseline">
                <span className="font-medium w-32">Environment:</span>
                <code className="bg-blue-100 px-1 rounded">Production</code>
              </div>
            </div>
          </AlertDescription>
        </Alert>
        
        <Alert className="bg-amber-50 border-amber-200 mb-4">
          <Database className="h-4 w-4 text-amber-800" />
          <AlertTitle className="text-amber-800">Database Verification Results</AlertTitle>
          <AlertDescription className="text-amber-700">
            No database check performed.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          <Button 
            variant="default" 
            className="w-full" 
            onClick={checkSubdomain}
          >
            Check Subdomain in Database
          </Button>
          
          <Button 
            variant="default" 
            className="w-full bg-blue-800 hover:bg-blue-900" 
            onClick={handleDiagnostic}
          >
            Run Diagnostic Tool
          </Button>
          
          <Button 
            variant="default" 
            className="w-full bg-blue-800 hover:bg-blue-900" 
            onClick={handleReturnHome}
          >
            Return to Home
          </Button>
          
          {orgId && (
            <Button 
              variant="outline" 
              className="w-full border-blue-800 text-blue-800"
              onClick={goToDashboard}
            >
              Go to Organization Dashboard
            </Button>
          )}
        </div>
        
        <div className="mt-6 border-t pt-4">
          <h3 className="text-center text-gray-600 mb-3">
            Are you trying to access a church website? Check these common issues:
          </h3>
          <ul className="list-disc pl-6 space-y-1 text-gray-600">
            <li>The subdomain is spelled correctly</li>
            <li>The organization has configured their domain in settings</li>
            <li>The organization has enabled their website in settings</li>
            <li>The organization has created and published a homepage</li>
          </ul>
        </div>
        
        {orgId && (
          <div className="mt-4 text-sm text-gray-500 border-t pt-4">
            <p className="font-medium">For organization administrators:</p>
            <ol className="list-decimal pl-5 mt-1">
              <li>Go to your organization dashboard to configure website settings</li>
            </ol>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ErrorState;
