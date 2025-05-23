
import React from 'react';
import LoginDialog from '@/components/auth/LoginDialog';

interface LoginRequiredStateProps {
  orgName?: string | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const LoginRequiredState: React.FC<LoginRequiredStateProps> = ({ orgName, isOpen, setIsOpen }) => {
  return (
    <>
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md p-6">
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="mb-4 text-gray-600">
            Please log in to access {orgName || 'this site'}.
          </p>
        </div>
      </div>
      <LoginDialog 
        isOpen={isOpen} 
        setIsOpen={(open) => {
          setIsOpen(open);
          if (!open) {
            // If dialog closes, reload to check auth again
            window.location.reload();
          }
        }} 
      />
    </>
  );
};

export default LoginRequiredState;
