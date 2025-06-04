
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/components/context/TenantContext';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { isMainDomain } from '@/utils/domain';

// Import dashboard components
import SuperAdminDashboard from '@/components/dashboard/SuperAdminDashboard';
import OrganizationDashboard from '@/components/dashboard/OrganizationDashboard';
import LoginPrompt from '@/components/routing/components/LoginPrompt';
import ErrorFallback from '@/components/routing/components/ErrorFallback';

interface RouteState {
  isReady: boolean;
  userRole: 'super_admin' | 'org_admin' | 'regular_user' | 'unknown';
  targetOrgId: string | null;
  isCheckingRole: boolean;
  error: string | null;
}

const EnhancedRouter: React.FC = () => {
  const { isAuthenticated, isCheckingAuth } = useAuthStatus();
  const { organizationId: contextOrgId, organizationName, isContextReady, isSubdomainAccess } = useTenantContext();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [routeState, setRouteState] = useState<RouteState>({
    isReady: false,
    userRole: 'unknown',
    targetOrgId: null,
    isCheckingRole: true,
    error: null
  });

  const hostname = window.location.hostname;
  const isMainDomainAccess = isMainDomain(hostname);
  
  // Extract organization ID from URL params
  const urlParams = new URLSearchParams(location.search);
  const urlOrgId = urlParams.get('org');
  const isAdminParam = urlParams.get('admin') === 'true';

  console.log("EnhancedRouter: Route analysis", {
    pathname: location.pathname,
    isMainDomainAccess,
    isSubdomainAccess,
    contextOrgId,
    urlOrgId,
    isAdminParam,
    isAuthenticated,
    isCheckingAuth,
    isContextReady
  });

  // Determine user role and target organization
  useEffect(() => {
    const determineUserRole = async () => {
      if (!isAuthenticated || !isContextReady) {
        console.log("EnhancedRouter: Not ready for role check");
        return;
      }

      setRouteState(prev => ({ ...prev, isCheckingRole: true, error: null }));

      try {
        // Check if user is super admin
        const { data: isSuperAdmin, error: superAdminError } = await supabase.rpc('direct_super_admin_check');
        
        if (superAdminError) {
          console.error("EnhancedRouter: Super admin check failed:", superAdminError);
        }

        console.log("EnhancedRouter: Super admin status:", isSuperAdmin);

        // Determine target organization and user role
        let targetOrgId: string | null = null;
        let userRole: RouteState['userRole'] = 'unknown';

        if (isSuperAdmin) {
          userRole = 'super_admin';
          
          // For super admins, determine target org from URL or context
          if (urlOrgId) {
            targetOrgId = urlOrgId;
          } else if (isSubdomainAccess && contextOrgId) {
            targetOrgId = contextOrgId;
          }
          // If no specific org, super admin goes to main dashboard
        } else {
          // Regular user - check organization membership
          if (isSubdomainAccess && contextOrgId) {
            // Check if user has access to this organization
            const { data: membership, error: membershipError } = await supabase
              .from('organization_members')
              .select('role')
              .eq('organization_id', contextOrgId)
              .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
              .single();

            if (membershipError || !membership) {
              console.log("EnhancedRouter: User has no access to this organization");
              userRole = 'regular_user';
            } else {
              targetOrgId = contextOrgId;
              userRole = ['admin', 'editor'].includes(membership.role) ? 'org_admin' : 'regular_user';
            }
          } else if (urlOrgId) {
            // Check membership for URL-specified org
            const { data: membership, error: membershipError } = await supabase
              .from('organization_members')
              .select('role')
              .eq('organization_id', urlOrgId)
              .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
              .single();

            if (membershipError || !membership) {
              setRouteState(prev => ({ 
                ...prev, 
                error: "You don't have access to this organization",
                isCheckingRole: false 
              }));
              return;
            }

            targetOrgId = urlOrgId;
            userRole = ['admin', 'editor'].includes(membership.role) ? 'org_admin' : 'regular_user';
          } else {
            userRole = 'regular_user';
          }
        }

        console.log("EnhancedRouter: Final role determination", {
          userRole,
          targetOrgId,
          isSuperAdmin
        });

        setRouteState({
          isReady: true,
          userRole,
          targetOrgId,
          isCheckingRole: false,
          error: null
        });

      } catch (error) {
        console.error("EnhancedRouter: Error determining user role:", error);
        setRouteState(prev => ({
          ...prev,
          error: "Failed to determine user permissions",
          userRole: 'unknown',
          isCheckingRole: false
        }));
      }
    };

    determineUserRole();
  }, [isAuthenticated, isContextReady, urlOrgId, contextOrgId, isSubdomainAccess]);

  // Show loading while checking auth or role
  if (isCheckingAuth || routeState.isCheckingRole || !isContextReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">
            {isCheckingAuth ? 'Checking authentication...' :
             routeState.isCheckingRole ? 'Determining permissions...' :
             'Initializing...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error with fallback options
  if (routeState.error) {
    return <ErrorFallback error={routeState.error} />;
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return <LoginPrompt organizationName={organizationName} isMainDomain={isMainDomainAccess} />;
  }

  // Route based on role and context
  console.log("EnhancedRouter: Routing decision", {
    userRole: routeState.userRole,
    targetOrgId: routeState.targetOrgId,
    isMainDomainAccess,
    pathname: location.pathname
  });

  // Super admin routing
  if (routeState.userRole === 'super_admin') {
    if (routeState.targetOrgId) {
      // Super admin accessing specific organization
      return <OrganizationDashboard />;
    } else {
      // Super admin main dashboard
      return <SuperAdminDashboard />;
    }
  }

  // Organization admin routing
  if (routeState.userRole === 'org_admin' && routeState.targetOrgId) {
    return <OrganizationDashboard />;
  }

  // Regular users or users without proper access
  if (routeState.userRole === 'regular_user' || routeState.userRole === 'unknown') {
    return (
      <ErrorFallback 
        error="You don't have permission to access this dashboard" 
        showHomeButton={true}
      />
    );
  }

  // Fallback
  return <ErrorFallback error="Unknown routing state" />;
};

export default EnhancedRouter;
