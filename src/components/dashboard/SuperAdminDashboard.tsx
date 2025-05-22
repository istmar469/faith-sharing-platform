
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingState from './LoadingState';
import AccessDenied from './AccessDenied';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useSuperAdminData } from './hooks/useSuperAdminData';
import { supabase } from '@/integrations/supabase/client';
import SuperAdminContent from './SuperAdminContent';
import RedirectScreen from './RedirectScreen';
import { useRedirectLogic } from './hooks/useRedirectLogic';

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

  // Use the redirect logic hook
  const { redirectInProgress, redirectToUserDashboard } = useRedirectLogic();

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

  // Handle organization click
  const handleOrgClick = useCallback((orgId: string) => {
    navigate(`/tenant-dashboard/${orgId}`);
  }, [navigate]);

  // Auto redirect when we determine user is not a super admin
  useEffect(() => {
    if (isAuthenticated && statusChecked && !isAllowed && !redirectInProgress) {
      redirectToUserDashboard();
    }
  }, [isAuthenticated, statusChecked, isAllowed, redirectToUserDashboard, redirectInProgress]);

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

  // If non-super admin tries to access, show redirect message
  if (statusChecked && !isAllowed && isAuthenticated) {
    return <RedirectScreen onRedirect={redirectToUserDashboard} />;
  }

  // Type check to ensure handleSignOut is () => Promise<void>
  // This ensures TypeScript sees the correct typing
  const signOutFn: () => Promise<void> = handleSignOut;
  
  // Super admin dashboard view
  return (
    <SuperAdminContent
      loading={loading}
      error={error}
      organizations={organizations}
      onOrgClick={handleOrgClick}
      onRetry={handleRetry}
      onAuthRetry={handleAuthRetry}
      onSignOut={signOutFn} // Pass the checked function
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      onRefresh={fetchOrganizations}
    />
  );
};

export default SuperAdminDashboard;
