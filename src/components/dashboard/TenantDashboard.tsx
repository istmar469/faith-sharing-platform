
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import LoginDialog from '../auth/LoginDialog';
import OrganizationSelection from './OrganizationSelection';
import TenantView from './TenantView';
import AuthError from './AuthError';
import AuthRequired from './AuthRequired';
import { useTenantDashboard } from './hooks/useTenantDashboard';

const TenantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const {
    isLoading,
    error,
    userOrganizations,
    isSuperAdmin,
    loginDialogOpen,
    setLoginDialogOpen,
    showComingSoonToast
  } = useTenantDashboard();
  
  // If super admin without specific org ID, redirect to super admin dashboard
  useEffect(() => {
    if (!isLoading && isSuperAdmin && !params.organizationId) {
      console.log("Super admin detected without org ID - redirecting to super admin dashboard");
      navigate('/dashboard');
    }
  }, [isLoading, isSuperAdmin, params.organizationId, navigate]);
  
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
  
  // If super admin on the path without specific org ID,
  // show organization selection interface
  if (isSuperAdmin && !params.organizationId && userOrganizations.length > 0) {
    console.log("Rendering org selection for super admin");
    return (
      <OrganizationSelection 
        userOrganizations={userOrganizations} 
        isSuperAdmin={isSuperAdmin} 
      />
    );
  }
  
  // If regular user with multiple orgs and no specific org selected,
  // show organization selection
  if (!params.organizationId && userOrganizations.length > 1) {
    console.log("Rendering org selection for user with multiple orgs");
    return (
      <OrganizationSelection 
        userOrganizations={userOrganizations} 
        isSuperAdmin={isSuperAdmin} 
      />
    );
  }
  
  // Default tenant dashboard view for specific organization
  return (
    <TenantView 
      userOrganizations={userOrganizations}
      isSuperAdmin={isSuperAdmin}
      showComingSoonToast={showComingSoonToast}
    />
  );
};

export default TenantDashboard;
