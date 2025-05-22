
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

  // Show loading screen while authentication check is in progress
  if (isCheckingAuth || (!statusChecked && !isUserChecked)) {
    return (
      <LoadingState 
        message="Checking authentication status..." 
        onRetry={handleRetry}
        timeout={3000}
        routeInfo="/dashboard (SuperAdminDashboard)"
        errorDetails={`Current auth status: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}, User checked: ${isUserChecked}, Admin status checked: ${statusChecked}, Retry count: ${retryCount}`}
      />
    );
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

  // If non-super admin tries to access, redirect to tenant dashboard
  if (statusChecked && !isAllowed && isAuthenticated) {
    console.log("User is authenticated but not a super admin, redirecting to tenant dashboard");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <h2 className="text-2xl font-bold mb-4">Redirecting to your dashboard</h2>
          <p className="mb-6">You're logged in as a regular user. Redirecting to your organization dashboard.</p>
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <div className="mt-4">
            <Button 
              onClick={() => navigate('/tenant-dashboard')}
              className="w-full"
            >
              Continue to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Super admin dashboard view - simplified check to avoid getting stuck
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
