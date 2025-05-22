
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { FileText, Pencil } from 'lucide-react';

interface EmptyStateProps {
  orgName: string | null;
  orgData: any | null;
}

const EmptyState = ({ orgName, orgData }: EmptyStateProps) => {
  const navigate = useNavigate();
  
  const navigateToPageBuilder = () => {
    if (orgData?.id) {
      navigate(`/page-builder?organization_id=${orgData.id}`);
    } else {
      navigate('/dashboard');
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background p-4">
      <Alert className="max-w-md mb-4">
        <FileText className="h-4 w-4" />
        <AlertTitle>No Homepage Found</AlertTitle>
        <AlertDescription>
          <p className="mb-4">
            No published homepage was found for {orgName || 'this organization'}.
            {orgData?.website_enabled === false && 
              " Additionally, website functionality is currently disabled for this organization."}
          </p>
          
          {orgData && (
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button 
                onClick={navigateToPageBuilder}
                className="flex items-center"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Create Homepage
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/dashboard')} 
              >
                Go to Dashboard
              </Button>
            </div>
          )}
          
          {!orgData && (
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="mt-4"
            >
              Go to Dashboard
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default EmptyState;
