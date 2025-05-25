
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingState from './LoadingState';
import AccessDenied from './AccessDenied';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useSuperAdminData } from './hooks/useSuperAdminData';
import SuperAdminContent from './SuperAdminContent';
import RedirectScreen from './RedirectScreen';
import { useRedirectLogic } from './hooks/useRedirectLogic';

const SuperAdminDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  // Use custom hooks for authentication and data fetching
  const {
    isAuthenticated,
    isUserChecked,
    isCheckingAuth,
    handleRetry,
    handleSignOut,
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

  // Use the redirect logic hook
  const { redirectToUserDashboard } = useRedirectLogic();

  // Handle organization click - navigate to the organization dashboard
  const handleOrgClick = useCallback((orgId: string) => {
    navigate(`/dashboard?org=${orgId}`);
  }, [navigate]);
  
  // Show loading screen while authentication check is in progress
  if (isCheckingAuth || (!statusChecked && !isUserChecked)) {
    return <LoadingState message="Checking authentication status..." onRetry={handleRetry} />;
  }
  
  // If not authenticated at all, show access denied with login form
  if (!isAuthenticated) {
    return (
      <AccessDenied 
        message="You need to be logged in to access this page"
        isAuthError={true}
        onLoginClick={() => navigate('/auth', { replace: true })}
      />
    );
  }
  
  // If authenticated but not allowed, show redirect screen
  if (statusChecked && !isAllowed && isAuthenticated) {
    return <RedirectScreen onRedirect={redirectToUserDashboard} />;
  }
  
  // Super admin dashboard view
  return (
    <SuperAdminContent
      loading={loading}
      error={error}
      organizations={organizations}
      onOrgClick={handleOrgClick}
      onRetry={handleRetry}
      onSignOut={handleSignOut}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      onRefresh={fetchOrganizations}
      isSuperAdmin={isAllowed} // Pass the super admin status
    />
  );
};

export default SuperAdminDashboard;
