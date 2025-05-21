
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from 'lucide-react';

type OrganizationErrorProps = {
  error: string | null;
};

const OrganizationError: React.FC<OrganizationErrorProps> = ({ error }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-center h-screen">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error || "Organization not found"}
          <div className="mt-4">
            <Button onClick={() => navigate('/super-admin')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default OrganizationError;
