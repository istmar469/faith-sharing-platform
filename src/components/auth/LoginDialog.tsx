
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AuthForm from './AuthForm';

interface LoginDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  redirectPath?: string;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ 
  isOpen, 
  setIsOpen, 
  redirectPath 
}) => {
  const handleSuccess = () => {
    setIsOpen(false);
    
    if (redirectPath && !window.location.pathname.includes('/tenant-dashboard/')) {
      window.location.href = redirectPath;
    }
    else if (window.location.hostname.includes('.church-os.com') && 
             window.location.hostname !== 'church-os.com') {
      // For subdomain access, just close dialog and stay on current page
      return;
    }
    else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Church-OS</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <AuthForm onSuccess={handleSuccess} />
        </div>
        <div className="mt-2 flex justify-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsOpen(false)}
            className="text-gray-500"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
