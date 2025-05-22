
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface AuthErrorProps {
  error: string | null;
  onLogin: () => void;
}

const AuthError: React.FC<AuthErrorProps> = ({ error, onLogin }) => {
  return (
    <div className="flex items-center justify-center h-screen">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <div className="mt-4">
            <Button onClick={onLogin}>
              Log In
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AuthError;
