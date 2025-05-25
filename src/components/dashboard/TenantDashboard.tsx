
import React, { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import LoginDialog from '../auth/LoginDialog';
import OrganizationSelection from './OrganizationSelection';
import ChurchManagementDashboard from './ChurchManagementDashboard';
import AuthError from './AuthError';
import AuthRequired from './AuthRequired';
import { useTenantDashboard } from './hooks/useTenantDashboard';
import { useTenantContext } from '../context/TenantContext';

const TenantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const { isContextReady } = useTenantContext();
  
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
  
  // Log important context info
  useEffect(() => {
    console.log("TenantDashboard: Current context and route info:", {
      paramOrgId: params.organizationId,
      isSuperAdmin,
      userOrganizations: userOrganizations?.length,
      pathname: location.pathname,
      isContextReady,
      currentOrganization: currentOrganization?.name
    });
  }, [params.organizationId, isSuperAdmin, userOrganizations, location.pathname, isContextReady, currentOrganization]);
  
  // Check if user has access to the requested organization
  useEffect(() => {
    if (!isLoading && params.organizationId && userOrganizations.length > 0) {
      const hasAccess = userOrganizations.some(org => org.id === params.organizationId) || isSuperAdmin;
      
      if (!hasAccess) {
        console.warn("TenantDashboard: User does not have access to organization:", params.organizationId);
        // Redirect to organization selection or first available org
        if (userOrganizations.length === 1) {
          navigate(`/tenant-dashboard/${userOrganizations[0].id}`, { replace: true });
        } else if (userOrganizations.length > 1) {
          navigate('/tenant-dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    }
  }, [isLoading, params.organizationId, userOrganizations, isSuperAdmin, navigate]);
  
  if (!isContextReady || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center px-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-lg font-medium">Loading your dashboard...</p>
          {!isContextReady && (
            <p className="text-sm text-gray-500 mt-2">Initializing context...</p>
          )}
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
  
  // If no organizations available and not super admin, show appropriate message
  if (userOrganizations.length === 0 && !isSuperAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center max-w-md p-6">
          <h2 className="text-2xl font-bold mb-2">No Organizations</h2>
          <p className="mb-4 text-gray-600">You don't have access to any organizations.</p>
        </div>
      </div>
    );
  }
  
  // If we have multiple organizations but no specific one is selected,
  // show organization selection interface
  if (!params.organizationId && userOrganizations.length > 1) {
    console.log("TenantDashboard: Rendering org selection for user with multiple orgs");
    return (
      <OrganizationSelection 
        userOrganizations={userOrganizations} 
        isSuperAdmin={isSuperAdmin} 
      />
    );
  }
  
  // If we have exactly one organization and no specific one is selected, redirect to it
  if (!params.organizationId && userOrganizations.length === 1) {
    navigate(`/tenant-dashboard/${userOrganizations[0].id}`, { replace: true });
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center px-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-lg font-medium">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Show organization selection for the case where no specific org is selected
  if (!params.organizationId) {
    return (
      <OrganizationSelection 
        userOrganizations={userOrganizations} 
        isSuperAdmin={isSuperAdmin} 
      />
    );
  }
  
  // Default to the comprehensive church management dashboard
  console.log("TenantDashboard: Rendering church management dashboard for org:", params.organizationId);
  return <ChurchManagementDashboard />;
};

export default TenantDashboard;
