
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AuthForm from './AuthForm';

interface LoginDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ isOpen, setIsOpen }) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Church-OS</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <AuthForm />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
