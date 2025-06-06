import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/components/context/TenantContext';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { isMainDomain } from '@/utils/domain';

// Import the dashboard components
import SuperAdminDashboard from '@/components/dashboard/SuperAdminDashboard';
import OrganizationDashboard from '@/components/dashboard/OrganizationDashboard';
import LoginPrompt from './components/LoginPrompt';
import ErrorFallback from './components/ErrorFallback';

type UserRole = 'super_admin' | 'org_admin' | 'regular_user' | 'unknown';

const SimpleRoleRouter: React.FC = () => {
  const { isAuthenticated, isCheckingAuth } = useAuthStatus();
  const { organizationId, organizationName, isContextReady } = useTenantContext();
  const [userRole, setUserRole] = useState<UserRole>('unknown');
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hostname = window.location.hostname;
  const isMainDomainAccess = isMainDomain(hostname);

  console.log("SimpleRoleRouter: Initial state", {
    isAuthenticated,
    isCheckingAuth,
    isContextReady,
    organizationId,
    organizationName,
    hostname,
    isMainDomainAccess,
    userRole
  });

  // Step 1: Check user role once authenticated
  useEffect(() => {
    const checkUserRole = async () => {
      if (!isAuthenticated || !isContextReady) {
        console.log("SimpleRoleRouter: Not ready to check role", { isAuthenticated, isContextReady });
        return;
      }

      setIsCheckingRole(true);
      setError(null);

      try {
        console.log("SimpleRoleRouter: Checking user role...");

        // First check if super admin using the correct function that checks super_admins table
        const { data: adminStatus, error: superAdminError } = await supabase.rpc('get_my_admin_status');
        
        if (superAdminError) {
          console.error("SimpleRoleRouter: Super admin check failed:", superAdminError);
        } else if (adminStatus && adminStatus.length > 0 && adminStatus[0].is_super_admin === true) {
          console.log("SimpleRoleRouter: User is super admin");
          setUserRole('super_admin');
          setIsCheckingRole(false);
          return;
        }

        // If not super admin and we're on a subdomain, check org membership
        if (!isMainDomainAccess && organizationId) {
          console.log("SimpleRoleRouter: Checking org membership for org:", organizationId);
          
          const { data: membership, error: membershipError } = await supabase
            .from('organization_members')
            .select('role')
            .eq('organization_id', organizationId)
            .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
            .single();

          if (membershipError) {
            console.error("SimpleRoleRouter: Membership check failed:", membershipError);
            setUserRole('regular_user');
          } else if (membership && ['admin', 'editor'].includes(membership.role)) {
            console.log("SimpleRoleRouter: User is org admin/editor");
            setUserRole('org_admin');
          } else {
            console.log("SimpleRoleRouter: User is regular member");
            setUserRole('regular_user');
          }
        } else {
          // Main domain access without super admin privileges
          console.log("SimpleRoleRouter: Main domain access, not super admin");
          setUserRole('regular_user');
        }

      } catch (error) {
        console.error("SimpleRoleRouter: Error checking user role:", error);
        setError("Failed to determine user permissions");
        setUserRole('unknown');
      } finally {
        setIsCheckingRole(false);
      }
    };

    checkUserRole();
  }, [isAuthenticated, isContextReady, organizationId, isMainDomainAccess]);

  // Show loading while checking auth or role
  if (isCheckingAuth || isCheckingRole || !isContextReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">
            {isCheckingAuth ? 'Checking authentication...' :
             isCheckingRole ? 'Determining permissions...' :
             'Initializing...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error with fallback options
  if (error) {
    return <ErrorFallback error={error} />;
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return <LoginPrompt organizationName={organizationName} isMainDomain={isMainDomainAccess} />;
  }

  // Route based on role and context
  console.log("SimpleRoleRouter: Routing user", { userRole, isMainDomainAccess, organizationId });

  // Super admins get super admin dashboard
  if (userRole === 'super_admin') {
    return <SuperAdminDashboard />;
  }

  // Org admins get organization dashboard
  if (userRole === 'org_admin' && organizationId) {
    return <OrganizationDashboard />;
  }

  // Regular users or users without proper access
  if (userRole === 'regular_user' || userRole === 'unknown') {
    return (
      <ErrorFallback 
        error="You don't have permission to access this dashboard" 
        showHomeButton={true}
      />
    );
  }

  // Fallback - should not reach here
  return <ErrorFallback error="Unknown routing state" />;
};

export default SimpleRoleRouter; 