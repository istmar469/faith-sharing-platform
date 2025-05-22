
import React from 'react';
import { Loader2 } from 'lucide-react';
import LoginDialog from '../auth/LoginDialog';
import OrganizationSelection from './OrganizationSelection';
import TenantView from './TenantView';
import AuthError from './AuthError';
import AuthRequired from './AuthRequired';
import { useTenantDashboard } from './hooks/useTenantDashboard';

const TenantDashboard: React.FC = () => {
  const {
    isLoading,
    error,
    userOrganizations,
    isSuperAdmin,
    loginDialogOpen,
    setLoginDialogOpen,
    showComingSoonToast
  } = useTenantDashboard();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (loginDialogOpen) {
    return (
      <>
        <AuthRequired />
        <LoginDialog 
          isOpen={loginDialogOpen} 
          setIsOpen={(open) => {
            setLoginDialogOpen(open);
            if (!open) {
              // If the dialog is closed, refresh the page to check auth again
              window.location.reload();
            }
          }} 
        />
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <AuthError 
          error={error} 
          onLogin={() => setLoginDialogOpen(true)} 
        />
        <LoginDialog 
          isOpen={loginDialogOpen} 
          setIsOpen={setLoginDialogOpen} 
        />
      </>
    );
  }
  
  // If super admin, show a page to select which organization to manage
  if (isSuperAdmin && userOrganizations.length > 0) {
    return (
      <OrganizationSelection 
        userOrganizations={userOrganizations} 
        isSuperAdmin={isSuperAdmin} 
      />
    );
  }
  
  // Default tenant dashboard view for single organization users
  return (
    <TenantView 
      userOrganizations={userOrganizations}
      isSuperAdmin={isSuperAdmin}
      showComingSoonToast={showComingSoonToast}
    />
  );
};

export default TenantDashboard;
