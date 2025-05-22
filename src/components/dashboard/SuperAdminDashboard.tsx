
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SideNav from './SideNav';
import LoadingState from './LoadingState';
import AccessDenied from './AccessDenied';
import OrganizationsSearch from './OrganizationsSearch';
import SuperAdminHeader from './SuperAdminHeader';
import OrganizationDataDisplay from './OrganizationDataDisplay';
import { useSuperAdminData } from './hooks/useSuperAdminData';
import { useAuthStatus } from './hooks/useAuthStatus';

/**
 * Dashboard component for super admins
 */
const SuperAdminDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  // Use custom hooks for authentication and data fetching
  const {
    isAuthenticated,
    isUserChecked,
    isCheckingAuth,
    handleRetry,
    handleAuthRetry,
    handleSignOut,
    retryCount
  } = useAuthStatus();
  
  // Use the custom hook for super admin data
  const { 
    organizations, 
    loading, 
    error, 
    isAllowed, 
    statusChecked,
    fetchOrganizations
  } = useSuperAdminData();

  // Handle search filtering
  const filteredOrganizations = organizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOrgClick = useCallback((orgId: string) => {
    navigate(`/tenant-dashboard/${orgId}`);
  }, [navigate]);

  // Show detailed diagnostic information for debugging
  const getErrorDetails = () => {
    if (isCheckingAuth) {
      return `Authentication check in progress. Retry count: ${retryCount}`;
    } else if (!isUserChecked) {
      return "User authentication check not completed yet";
    } else if (!statusChecked) {
      return "Admin status check not completed yet";
    } else if (error) {
      return `Error: ${error}`;
    }
    return "Unknown issue with authentication flow";
  };

  // Show loading screen while authentication check is in progress
  if (isCheckingAuth || (!statusChecked || !isUserChecked)) {
    return (
      <LoadingState 
        message="Checking authentication status..." 
        onRetry={handleRetry}
        timeout={3000}
        routeInfo="/dashboard (SuperAdminDashboard)"
        errorDetails={getErrorDetails()}
      />
    );
  }
  
  // If not authenticated at all, show access denied with login form
  if (!isAuthenticated) {
    return (
      <AccessDenied 
        message="You need to be logged in to access this page"
        isAuthError={true}
      />
    );
  }
  
  // If authenticated but not a super admin, show access denied
  if (!isAllowed) {
    return (
      <AccessDenied 
        message="You need to be logged in as a super admin to access this page"
        isAuthError={false}
      />
    );
  }

  // Super admin dashboard view
  return (
    <div className="flex min-h-screen">
      <SideNav />
      <div className="flex-1 p-6">
        <SuperAdminHeader onSignOut={handleSignOut} />
        
        <OrganizationsSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onRefresh={fetchOrganizations}
        />

        <OrganizationDataDisplay
          loading={loading}
          error={error}
          filteredOrganizations={filteredOrganizations}
          onOrgClick={handleOrgClick}
          onRetry={handleRetry}
          onAuthRetry={handleAuthRetry}
        />
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
