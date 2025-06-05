import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useTenantContext } from '@/components/context/TenantContext';
import LoginDialog from '@/components/auth/LoginDialog';
import RoleBasedLandingPage from './RoleBasedLandingPage';
import SuperAdminDashboard from './SuperAdminDashboard';
import OrganizationDashboard from './OrganizationDashboard';
import { isMainDomain } from '@/utils/domain';

interface Organization {
  id: string;
  name: string;
  subdomain: string | null;
  role: string;
  website_enabled: boolean;
  current_tier: string;
}

type UserRole = 'super_admin' | 'org_admin' | 'regular_user' | 'unknown';

const SmartDashboardRouter: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isCheckingAuth } = useAuthStatus();
  const { organizationId, isSubdomainAccess, organizationName } = useTenantContext();
  
  const [userRole, setUserRole] = useState<UserRole>('unknown');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse URL parameters
  const urlParams = new URLSearchParams(location.search);
  const isAdminAccess = urlParams.get('admin') === 'true';
  const specificOrgId = urlParams.get('org');

  useEffect(() => {
    const loadUserData = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log("SmartDashboardRouter: Loading user data...");

        // Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
          throw new Error('Failed to get user data');
        }

        // Check if user is super admin
        const { data: superAdminCheck, error: adminError } = await supabase.rpc('direct_super_admin_check');
        if (adminError) {
          console.error("Error checking super admin status:", adminError);
        }
        
        const isUserSuperAdmin = superAdminCheck === true;
        setIsSuperAdmin(isUserSuperAdmin);

        // Get user's organizations
        let userOrganizations: Organization[] = [];
        
        if (isUserSuperAdmin) {
          // Super admins can access all organizations but we'll show their specific ones
          const { data: userOrgs, error: userOrgsError } = await supabase
            .from('organization_members')
            .select(`
              role,
              organization:organizations(
                id,
                name,
                subdomain,
                website_enabled,
                current_tier
              )
            `)
            .eq('user_id', userData.user.id);

          if (!userOrgsError && userOrgs) {
            userOrganizations = userOrgs
              .filter(membership => membership.organization)
              .map(membership => ({
                id: membership.organization.id,
                name: membership.organization.name,
                subdomain: membership.organization.subdomain,
                role: membership.role,
                website_enabled: membership.organization.website_enabled,
                current_tier: membership.organization.current_tier || 'basic'
              }));
          }
        } else {
          // Regular users - get their organization memberships
          const { data: memberships, error: membershipError } = await supabase
            .from('organization_members')
            .select(`
              role,
              organization:organizations(
                id,
                name,
                subdomain,
                website_enabled,
                current_tier
              )
            `)
            .eq('user_id', userData.user.id)
            .in('role', ['admin', 'editor', 'owner']);

          if (!membershipError && memberships) {
            userOrganizations = memberships
              .filter(membership => membership.organization)
              .map(membership => ({
                id: membership.organization.id,
                name: membership.organization.name,
                subdomain: membership.organization.subdomain,
                role: membership.role,
                website_enabled: membership.organization.website_enabled,
                current_tier: membership.organization.current_tier || 'basic'
              }));
          }
        }

        setOrganizations(userOrganizations);

        // Determine user role
        let role: UserRole = 'regular_user';
        if (isUserSuperAdmin) {
          role = 'super_admin';
        } else if (userOrganizations.some(org => ['admin', 'owner'].includes(org.role))) {
          role = 'org_admin';
        }

        setUserRole(role);

        console.log("SmartDashboardRouter: User data loaded", {
          userRole: role,
          isSuperAdmin: isUserSuperAdmin,
          organizationCount: userOrganizations.length,
          isSubdomainAccess,
          organizationId
        });

      } catch (error) {
        console.error("SmartDashboardRouter: Error loading user data:", error);
        setError("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [isAuthenticated]);

  // Handle authentication requirement
  if (!isAuthenticated && !isCheckingAuth) {
    if (isSubdomainAccess && organizationName) {
      // On subdomain, show login dialog
      return (
        <>
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md p-6">
              <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
              <p className="mb-4 text-gray-600">
                Please log in to access the {organizationName} dashboard.
              </p>
              <button
                onClick={() => setShowLoginDialog(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Sign In
              </button>
            </div>
          </div>
          <LoginDialog 
            isOpen={showLoginDialog} 
            setIsOpen={setShowLoginDialog}
            defaultTab="login"
          />
        </>
      );
    } else {
      // On main domain, redirect to login page
      navigate('/login');
      return null;
    }
  }

  // Show loading
  if (isCheckingAuth || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">
            {isCheckingAuth ? 'Checking authentication...' : 'Loading user data...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <h2 className="text-2xl font-bold mb-2 text-red-600">Error</h2>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Routing logic based on user role and context
  console.log("SmartDashboardRouter: Routing decision", {
    userRole,
    isSuperAdmin,
    isAdminAccess,
    isSubdomainAccess,
    organizationId,
    specificOrgId,
    pathname: location.pathname
  });

  // Handle super admin routing
  if (isSuperAdmin && isAdminAccess) {
    // Super admin accessing admin panel
    return <SuperAdminDashboard />;
  }

  // Handle subdomain organization dashboard
  if (isSubdomainAccess && organizationId) {
    // User is on a subdomain and accessing org dashboard
    return <OrganizationDashboard />;
  }

  // Handle specific organization access (via URL param)
  if (specificOrgId) {
    // User is accessing a specific organization
    return <OrganizationDashboard />;
  }

  // Handle single organization redirect
  if (!isSuperAdmin && organizations.length === 1 && !isMainDomain(window.location.hostname)) {
    // User has access to only one organization, redirect to it
    const org = organizations[0];
    if (org.subdomain) {
      window.location.href = `https://${org.subdomain}.church-os.com/dashboard`;
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">Redirecting to {org.name}...</p>
          </div>
        </div>
      );
    } else {
      navigate(`/dashboard/${org.id}`, { replace: true });
      return null;
    }
  }

  // Default: Show role-based landing page
  // Filter out unknown role to satisfy TypeScript
  if (userRole === 'unknown') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="mb-4 text-gray-600">
            You don't have permission to access any dashboards.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <RoleBasedLandingPage
      userRole={userRole}
      organizations={organizations}
      isSuperAdmin={isSuperAdmin}
    />
  );
};

export default SmartDashboardRouter; 