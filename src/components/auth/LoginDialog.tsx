import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AuthForm from './AuthForm';
import { useTenantContext } from '@/components/context/TenantContext';

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
  const { isSubdomainAccess, organizationId, organizationName } = useTenantContext();

  const handleSuccess = () => {
    console.log('LoginDialog: Authentication successful', { 
      isSubdomainAccess, 
      organizationId, 
      currentUrl: window.location.href 
    });
    
    setIsOpen(false);
    
    // For subdomain access, just close the dialog and reload to show admin features
    if (isSubdomainAccess) {
      console.log('LoginDialog: Subdomain access - reloading page to show admin features');
      // Small delay to ensure auth state is updated
      setTimeout(() => {
        window.location.reload();
      }, 100);
      return;
    }
    
    // For main domain access, handle redirects as before
    if (redirectPath && !window.location.pathname.includes('/dashboard')) {
      console.log('LoginDialog: Redirecting to:', redirectPath);
      window.location.href = redirectPath;
    } else if (window.location.hostname.includes('.church-os.com') && 
               window.location.hostname !== 'church-os.com') {
      // For subdomain access, just close dialog and stay on current page
      console.log('LoginDialog: Subdomain - staying on current page');
      return;
    } else {
      console.log('LoginDialog: Redirecting to dashboard');
      window.location.href = '/dashboard';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {isSubdomainAccess ? `Staff Login - ${organizationName || 'Church'}` : 'Church-OS'}
          </DialogTitle>
          {isSubdomainAccess && (
            <p className="text-center text-sm text-gray-600 mt-2">
              Login to access admin features for this site
            </p>
          )}
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
