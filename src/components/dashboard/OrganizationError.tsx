
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle, RefreshCcw, Search, Database } from 'lucide-react';
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
  
  // Check if the error is about a non-existent organization
  const isOrgNotFoundError = error?.includes('No organization exists with ID');
  
  const checkOrganizationExists = async () => {
    if (!organizationId) return;
    
    setIsChecking(true);
    try {
      // Direct SQL query to check if the organization exists
      const { count, error: countError } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true });
      
      // Also check if this specific organization exists
      const { count: specificCount, error: specificError } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })
        .eq('id', organizationId);
      
      setCheckResult({
        totalOrganizations: count,
        totalError: countError,
        organizationExists: specificCount && specificCount > 0,
        specificError
      });
      
      toast({
        title: specificCount && specificCount > 0 ? 
          "Organization Exists" : 
          "Organization Not Found",
        description: specificCount && specificCount > 0 ?
          `The organization with ID ${organizationId} exists in the database.` :
          `The organization with ID ${organizationId} was not found. There are ${count} total organizations.`,
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
              {isChecking ? "Checking..." : "Check Database"}
            </Button>
            
            {checkResult && (
              <div className="mt-3 p-2 border rounded bg-gray-50 text-sm">
                <p>Total organizations: {checkResult.totalOrganizations || 'Error'}</p>
                <p>Organization exists: {checkResult.organizationExists ? 'Yes' : 'No'}</p>
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
                  onClick={() => navigate(`/tenant-dashboard/${org.id}`)}
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
