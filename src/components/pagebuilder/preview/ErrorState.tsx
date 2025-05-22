
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Info, Database, RefreshCcw, ArrowLeft, Bug } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DebugPanel from './DebugPanel';

interface ErrorStateProps {
  error: string;
  orgData?: any;
  debugInfo?: any;
}

const ErrorState = ({ error, orgData, debugInfo }: ErrorStateProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDebug, setShowDebug] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);
  
  // Check if the error is likely related to a non-existent organization
  const isOrgNotFoundError = error.includes('No organization exists with ID');
  const orgId = isOrgNotFoundError && debugInfo?.subdomain ? debugInfo.subdomain : null;
  
  // Automatically check the database when an org not found error is shown
  useEffect(() => {
    if (isOrgNotFoundError && orgId) {
      checkOrganizationStatus();
    }
  }, []);

  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };
  
  // Check if the organization exists in the database
  const checkOrganizationStatus = async () => {
    if (!orgId) return;
    
    setIsChecking(true);
    try {
      console.log("Checking organization existence for ID:", orgId);
      
      // Check if this specific organization exists
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .maybeSingle();
      
      // Also get total count of organizations for context
      const { count } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true });
      
      setCheckResult({
        totalOrganizations: count,
        organizationData: orgData,
        organizationError: orgError,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: orgData ? "Organization Found" : "Organization Not Found", 
        description: orgData ?
          `The organization "${orgData.name}" with ID ${orgId} exists in the database but may have website_enabled=false` :
          `The organization with ID ${orgId} was not found. There are ${count || 0} total organizations.`,
        variant: orgData ? "default" : "destructive"
      });
    } catch (err) {
      console.error("Error checking organizations:", err);
      setCheckResult({
        error: err,
        timestamp: new Date().toISOString()
      });
      toast({
        title: "Error Checking Database",
        description: "An error occurred while checking the organization status.",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

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
              
              {checkResult && checkResult.organizationData && (
                <div className="p-2 mt-2 bg-green-50 border border-green-100 rounded">
                  <p className="text-sm font-medium text-green-800">
                    Organization was found in the database!
                  </p>
                  <p className="text-xs text-green-700">
                    Name: {checkResult.organizationData.name}<br/>
                    Website enabled: {checkResult.organizationData.website_enabled ? 'Yes' : 'No'}
                  </p>
                  <p className="text-xs mt-1 text-amber-700">
                    This suggests the error may be in the code logic checking for organization existence.
                  </p>
                </div>
              )}
              
              <Button 
                onClick={checkOrganizationStatus}
                disabled={isChecking}
                className="mt-3"
                size="sm"
                variant="outline"
              >
                {isChecking ? "Checking..." : "Check Database"}
              </Button>
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
            <Bug className="mr-2 h-4 w-4" />
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
