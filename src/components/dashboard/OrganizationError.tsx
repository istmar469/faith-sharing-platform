
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle, RefreshCcw, Search } from 'lucide-react';

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
