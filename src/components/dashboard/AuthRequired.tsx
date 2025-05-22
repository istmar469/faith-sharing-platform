
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

const AuthRequired: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <Alert className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          Please log in to access the dashboard
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AuthRequired;
