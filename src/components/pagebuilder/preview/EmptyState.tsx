
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  orgName: string | null;
}

const EmptyState = ({ orgName }: EmptyStateProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <Alert className="max-w-md mb-4">
        <AlertDescription>
          No published homepage found for {orgName || 'this organization'}
        </AlertDescription>
      </Alert>
      <Button 
        onClick={() => navigate('/dashboard')} 
        className="mt-4"
      >
        Go to Dashboard
      </Button>
    </div>
  );
};

export default EmptyState;
