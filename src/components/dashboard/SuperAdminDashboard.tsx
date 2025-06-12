import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingState from './LoadingState';
import AccessDenied from './AccessDenied';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useSuperAdminData } from './hooks/useSuperAdminData';
import SuperAdminContent from './SuperAdminContent';
import SuperAdminPagesManager from './SuperAdminPagesManager';
import RedirectScreen from './RedirectScreen';
import { useRedirectLogic } from './hooks/useRedirectLogic';

const SuperAdminDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('organizations');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're accessing via admin parameter - if so, bypass complex auth checks
  const urlParams = new URLSearchParams(location.search);
  const isAdminAccess = urlParams.get('admin') === 'true';
  
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

  // Handle organization click - redirect to organization subdomain
  const handleOrgClick = useCallback((organization: OrganizationData) => {
    if (organization.subdomain) {
      // Redirect to subdomain dashboard
      const protocol = window.location.protocol;
      const port = window.location.port ? `:${window.location.port}` : '';
      const subdomainUrl = `${protocol}//${organization.subdomain}.localhost${port}/dashboard`;
      console.log('Redirecting to subdomain:', subdomainUrl);
      window.location.href = subdomainUrl;
    } else {
      // Fallback to main domain with org parameter
      navigate(`/dashboard?org=${organization.id}`);
    }
  }, [navigate]);

  const handleNavigateToOrg = useCallback((organization: OrganizationData) => {
    if (organization.subdomain) {
      const protocol = window.location.protocol;
      const port = window.location.port ? `:${window.location.port}` : '';
      const subdomainUrl = `${protocol}//${organization.subdomain}.localhost${port}/dashboard`;
      window.location.href = subdomainUrl;
    } else {
      navigate(`/dashboard?org=${organization.id}`);
    }
  }, [navigate]);
  
  // If accessed via admin parameter and user is authenticated, bypass other checks
  if (isAdminAccess && isAuthenticated && !isCheckingAuth) {
    console.log("SuperAdminDashboard: Admin access detected, bypassing auth checks");
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="border-b bg-white">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-gray-600">Manage all organizations and pages</p>
          </div>
        </div>
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="organizations">Organizations</TabsTrigger>
              <TabsTrigger value="pages">All Pages</TabsTrigger>
            </TabsList>
            <TabsContent value="organizations" className="mt-6">
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
                isSuperAdmin={true}
              />
            </TabsContent>
            <TabsContent value="pages" className="mt-6">
              <SuperAdminPagesManager onNavigateToOrg={handleNavigateToOrg} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }
  
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
        onLoginClick={() => navigate('/login', { replace: true })}
      />
    );
  }
  
  // If authenticated but not allowed, show redirect screen
  if (statusChecked && !isAllowed && isAuthenticated) {
    return <RedirectScreen onRedirect={redirectToUserDashboard} />;
  }
  
  // Super admin dashboard view
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600">Manage all organizations and pages</p>
        </div>
      </div>
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
            <TabsTrigger value="pages">All Pages</TabsTrigger>
          </TabsList>
          <TabsContent value="organizations" className="mt-6">
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
              isSuperAdmin={isAllowed}
            />
          </TabsContent>
          <TabsContent value="pages" className="mt-6">
            <SuperAdminPagesManager onNavigateToOrg={handleNavigateToOrg} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
