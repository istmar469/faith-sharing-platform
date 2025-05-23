
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import LoginDialog from '../auth/LoginDialog';
import OrganizationSelection from './OrganizationSelection';
import TenantView from './TenantView';
import AuthError from './AuthError';
import AuthRequired from './AuthRequired';
import { useTenantDashboard } from './hooks/useTenantDashboard';
import { useTenantContext } from '../context/TenantContext';

const TenantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { subdomain, setTenantContext, isSubdomainAccess } = useTenantContext();
  
  const {
    isLoading,
    error,
    userOrganizations,
    currentOrganization,
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
    
    // Update tenant context when organization changes
    if (currentOrganization) {
      console.log("TenantDashboard: Setting tenant context with subdomain:", subdomain);
      setTenantContext(currentOrganization.id, currentOrganization.name, isSubdomainAccess);
    }
  }, [isLoading, isSuperAdmin, params.organizationId, navigate, setTenantContext, currentOrganization, isSubdomainAccess, subdomain]);
  
  // Log important context info
  useEffect(() => {
    console.log("TenantDashboard: Current context:", {
      subdomain,
      isSubdomainAccess,
      currentOrgId: currentOrganization?.id,
      paramOrgId: params.organizationId
    });
  }, [subdomain, isSubdomainAccess, currentOrganization, params.organizationId]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center px-4">
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
  
  // If we have multiple organizations but no specific one is selected,
  // show organization selection interface
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
      currentOrganization={currentOrganization}
      isSuperAdmin={isSuperAdmin}
      showComingSoonToast={showComingSoonToast}
    />
  );
};

export default TenantDashboard;
