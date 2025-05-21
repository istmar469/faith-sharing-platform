
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle, RefreshCcw } from 'lucide-react';

type OrganizationErrorProps = {
  error: string | null;
  onRetry?: () => void;
};

const OrganizationError: React.FC<OrganizationErrorProps> = ({ error, onRetry }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-center h-full">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          <p className="mb-4">{error || "Organization not found"}</p>
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
    </div>
  );
};

export default OrganizationError;
