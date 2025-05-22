
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideNav from './SideNav';
import LoadingState from './LoadingState';
import AccessDenied from './AccessDenied';
import OrganizationsSearch from './OrganizationsSearch';
import SuperAdminHeader from './SuperAdminHeader';
import OrganizationDataDisplay from './OrganizationDataDisplay';
import { useSuperAdminData } from './hooks/useSuperAdminData';
import { useAuthStatus } from './hooks/useAuthStatus';
import { supabase } from '@/integrations/supabase/client';

/**
 * Dashboard component for super admins
 */
const SuperAdminDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [lastAuthEvent, setLastAuthEvent] = useState<string | null>(null);
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

  // Log auth state changes for debugging
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      console.log(`Auth event in SuperAdminDashboard: ${event}`);
      setLastAuthEvent(event);
      
      // If user signs out, redirect to auth page
      if (event === 'SIGNED_OUT') {
        navigate('/auth', { replace: true });
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

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
    } else if (lastAuthEvent) {
      return `Last auth event: ${lastAuthEvent}`;
    }
    return "Unknown issue with authentication flow";
  };

  // Show loading screen while authentication check is in progress
  if (isCheckingAuth || (!statusChecked && !isUserChecked)) {
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
  
  // If authenticated but super admin check is still pending, show loading
  if (!statusChecked && isUserChecked && isAuthenticated) {
    return (
      <LoadingState 
        message="Verifying administrator privileges..." 
        onRetry={handleRetry}
        timeout={2000}
        routeInfo="/dashboard (SuperAdminDashboard - Admin Check)"
        errorDetails={`Auth verified, checking admin status. Retry count: ${retryCount}`}
      />
    );
  }
  
  // If authenticated but not a super admin, show access denied
  if (statusChecked && !isAllowed && isAuthenticated) {
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
