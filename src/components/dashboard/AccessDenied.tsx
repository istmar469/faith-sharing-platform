
import React from 'react';
import { Button } from "@/components/ui/button";

interface AccessDeniedProps {
  onLoginClick: () => void;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ onLoginClick }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
      <p className="mb-6">You do not have permission to view this page.</p>
      <Button onClick={onLoginClick}>
        Log In
      </Button>
    </div>
  );
};

export default AccessDenied;
