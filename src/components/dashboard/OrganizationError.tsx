import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info, Database, RefreshCcw, AlertCircle, Search } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type OrganizationErrorProps = {
  error: string | null;
  onRetry?: () => void;
  availableOrgs?: Array<{id: string, name: string}> | null;
};

const OrganizationError: React.FC<OrganizationErrorProps> = ({ 
  error, 
  onRetry, 
  availableOrgs 
}) => {
  const navigate = useNavigate();
  const { organizationId } = useParams<{ organizationId: string }>();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);
  const [debugMode, setDebugMode] = useState(false);
  
  // Check if the error is about a non-existent organization
  const isOrgNotFoundError = error?.includes('No organization exists with ID');

  // Effect to automatically check organization on mount if it's an org not found error
  useEffect(() => {
    if (isOrgNotFoundError && organizationId) {
      checkOrganizationExists();
    }
  }, []);
  
  const checkOrganizationExists = async () => {
    if (!organizationId) return;
    
    setIsChecking(true);
    try {
      console.log("Checking organization existence for ID:", organizationId);
      
      // Direct SQL query to check if the organization exists
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .maybeSingle();
      
      // Also get general count of organizations
      const { count, error: countError } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true });
      
      const result = {
        totalOrganizations: count,
        totalError: countError,
        organizationData: orgData,
        organizationError: orgError,
        timestamp: new Date().toISOString()
      };
      
      console.log("Organization check results:", result);
      setCheckResult(result);
      
      toast({
        title: orgData ? "Organization Found" : "Organization Not Found",
        description: orgData ?
          `The organization "${orgData.name}" with ID ${organizationId} exists in the database.` :
          `The organization with ID ${organizationId} was not found. There are ${count || 0} total organizations.`,
        variant: orgData ? "default" : "destructive"
      });
    } catch (err) {
      console.error("Error checking organization:", err);
      toast({
        title: "Error",
        description: "Failed to check organization existence",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <Alert variant="destructive" className="max-w-md mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          <p className="mb-4">{error || "Organization not found"}</p>
          
          {organizationId && (
            <p className="text-sm mb-4 bg-red-50 p-2 rounded border border-red-100">
              Attempted to access organization with ID: <span className="font-mono">{organizationId}</span>
            </p>
          )}
          
          {checkResult && checkResult.organizationData && (
            <div className="p-2 bg-green-50 border border-green-100 rounded mb-4">
              <p className="text-sm font-medium text-green-800">
                Organization found in database but access error occurred.
              </p>
              <p className="text-xs text-green-700">
                This may be a permissions or code logic issue rather than missing data.
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            {onRetry && (
              <Button variant="outline" onClick={onRetry}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>

      {isOrgNotFoundError && organizationId && (
        <Alert variant="warning" className="max-w-md mb-4">
          <Database className="h-4 w-4" />
          <AlertTitle>Database Check</AlertTitle>
          <AlertDescription>
            <p className="mb-2">The specified organization ID may not exist in the database.</p>
            
            <Button 
              onClick={checkOrganizationExists}
              disabled={isChecking}
              className="mt-2"
              size="sm"
              variant="outline"
            >
              {isChecking ? "Checking..." : "Check Database Again"}
            </Button>
            
            {checkResult && (
              <div className="mt-3 p-2 border rounded bg-gray-50 text-sm">
                <p>Total organizations: {checkResult.totalOrganizations || 'Error'}</p>
                <p>Organization found: {checkResult.organizationData ? 'Yes' : 'No'}</p>
                {checkResult.organizationData && (
                  <p>Name: {checkResult.organizationData.name}</p>
                )}
                <button 
                  onClick={() => setDebugMode(!debugMode)} 
                  className="text-blue-600 text-xs underline mt-1"
                >
                  {debugMode ? "Hide Details" : "Show Details"}
                </button>
                {debugMode && (
                  <pre className="mt-2 p-2 bg-gray-100 text-xs overflow-auto max-h-40">
                    {JSON.stringify(checkResult, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {availableOrgs && availableOrgs.length > 0 && (
        <Alert variant="info" className="max-w-md">
          <Search className="h-4 w-4" />
          <AlertTitle>Available Organizations</AlertTitle>
          <AlertDescription>
            <p className="mb-2">You have access to the following organizations:</p>
            <div className="space-y-2">
              {availableOrgs.map(org => (
                <Button 
                  key={org.id} 
                  variant="outline" 
                  className="w-full text-left justify-start"
                  onClick={() => navigate(`/dashboard?org=${org.id}`)}
                >
                  {org.name}
                </Button>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default OrganizationError;
