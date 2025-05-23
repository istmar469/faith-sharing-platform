
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface PageLoadErrorProps {
  error: string;
  organizationId: string | null;
}

const PageLoadError: React.FC<PageLoadErrorProps> = ({ error, organizationId }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Alert variant="destructive" className="max-w-md">
        <AlertTitle>Error Loading Page</AlertTitle>
        <AlertDescription>
          {error}
          {organizationId && (
            <div className="mt-4 flex justify-end">
              <Button onClick={() => navigate(`/page-builder/${organizationId}`)}>
                Create New Page Instead
              </Button>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PageLoadError;
