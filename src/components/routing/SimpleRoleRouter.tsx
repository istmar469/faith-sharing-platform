import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/components/context/TenantContext';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { isMainDomain } from '@/utils/domain';
import { isSuperAdmin } from '@/utils/superAdminCheck';

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
  const [isCheckingRole, setIsCheckingRole] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hostname = window.location.hostname;
  const isMainDomainAccess = isMainDomain(hostname);

  console.log("SimpleRoleRouter: Current state", {
    isAuthenticated,
    isCheckingAuth,
    isContextReady,
    organizationId,
    organizationName,
    hostname,
    isMainDomainAccess,
    userRole,
    isCheckingRole
  });

  // Step 1: Check user role once authenticated AND context is ready
  useEffect(() => {
    const checkUserRole = async () => {
      // Only proceed if user is authenticated AND context is ready
      if (!isAuthenticated || !isContextReady) {
        console.log("SimpleRoleRouter: Not ready to check role", { 
          isAuthenticated, 
          isContextReady, 
          isCheckingAuth 
        });
        setIsCheckingRole(false);
        return;
      }

      console.log("🔍 SimpleRoleRouter: Starting role check for authenticated user...");
      setIsCheckingRole(true);
      setError(null);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log("❌ SimpleRoleRouter: No user found despite isAuthenticated = true");
          setUserRole('unknown');
          return;
        }

        console.log("👤 SimpleRoleRouter: User found:", user.email);

        // Use unified super admin check with detailed logging
        console.log("🔧 SimpleRoleRouter: Calling isSuperAdmin()...");
        const adminStatus = await isSuperAdmin();
        console.log("🎯 SimpleRoleRouter: Super admin check result:", adminStatus);
        
        if (adminStatus) {
          console.log("✅ SimpleRoleRouter: User IS super admin - setting role to super_admin");
          setUserRole('super_admin');
          return;
        }

        // For main domain access, if user is authenticated but not super admin, 
        // still allow them to see the dashboard (they might have org access)
        if (isMainDomainAccess) {
          console.log("🏠 SimpleRoleRouter: Main domain access, checking for any org memberships...");
          
          const { data: anyMemberships, error: anyMembershipsError } = await supabase
            .from('organization_members')
            .select('role, organization_id')
            .eq('user_id', user.id)
            .limit(1);
          
          if (!anyMembershipsError && anyMemberships && anyMemberships.length > 0) {
            console.log("✅ SimpleRoleRouter: User has organization memberships, setting as org_admin");
            setUserRole('org_admin');
            return;
          } else {
            console.log("❌ SimpleRoleRouter: User has no organization memberships");
            setUserRole('regular_user');
            return;
          }
        }

        console.log("❌ SimpleRoleRouter: User is NOT super admin, checking org membership...");

        // If not super admin and we're on a subdomain, check org membership
        if (!isMainDomainAccess && organizationId) {
          console.log("🏢 SimpleRoleRouter: Checking org membership for org:", organizationId, "user:", user.id);
          
          const { data: membership, error: membershipError } = await supabase
            .from('organization_members')
            .select('role, organization_id, user_id')
            .eq('organization_id', organizationId)
            .eq('user_id', user.id)
            .single();

          console.log("🔍 SimpleRoleRouter: Membership query result:", { membership, membershipError });

          if (membershipError) {
            console.error("❌ SimpleRoleRouter: Membership check failed:", membershipError);
            
            // Check if user has any org memberships for debugging
            const { data: allMemberships, error: allMembershipsError } = await supabase
              .from('organization_members')
              .select('role, organization_id')
              .eq('user_id', user.id);
            
            console.log("🔍 SimpleRoleRouter: User's all memberships:", { allMemberships, allMembershipsError });
            
            // If it's a PGRST116 error (no rows found), try to auto-add user to subdomain organization
            if (membershipError.code === 'PGRST116' && !isMainDomainAccess && organizationId) {
              console.log("🔧 SimpleRoleRouter: No membership found, attempting to auto-add user to organization");
              
              try {
                const { error: insertError } = await supabase
                  .from('organization_members')
                  .insert({
                    organization_id: organizationId,
                    user_id: user.id,
                    role: 'admin' // Default to admin for subdomain access
                  });
                
                if (insertError) {
                  console.error("❌ SimpleRoleRouter: Failed to auto-add user:", insertError);
                  setUserRole('regular_user');
                } else {
                  console.log("✅ SimpleRoleRouter: Successfully auto-added user as admin");
                  setUserRole('org_admin');
                }
              } catch (autoAddError) {
                console.error("❌ SimpleRoleRouter: Auto-add failed:", autoAddError);
                setUserRole('regular_user');
              }
            } else {
              // If no membership found, still allow regular access for subdomains
              // The user might need to be added to the organization
              setUserRole('regular_user');
            }
          } else if (membership && ['admin', 'editor'].includes(membership.role)) {
            console.log("✅ SimpleRoleRouter: User is org admin/editor with role:", membership.role);
            setUserRole('org_admin');
          } else if (membership) {
            console.log("👥 SimpleRoleRouter: User is org member with role:", membership.role);
            setUserRole('regular_user');
          } else {
            console.log("❓ SimpleRoleRouter: No membership found but no error");
            setUserRole('regular_user');
          }
        } else {
          // Main domain access without super admin privileges
          console.log("🏠 SimpleRoleRouter: Main domain access, not super admin");
          setUserRole('regular_user');
        }

      } catch (error) {
        console.error("💥 SimpleRoleRouter: Error checking user role:", error);
        setError("Failed to determine user permissions");
        setUserRole('unknown');
      } finally {
        console.log("🏁 SimpleRoleRouter: Role check complete, setting isCheckingRole to false");
        setIsCheckingRole(false);
      }
    };

    // Reset role when authentication state changes
    if (!isAuthenticated) {
      console.log("🚪 SimpleRoleRouter: User not authenticated, resetting role");
      setUserRole('unknown');
      setIsCheckingRole(false);
    } else {
      checkUserRole();
    }
  }, [isAuthenticated, isContextReady, organizationId, isMainDomainAccess]);

  // Show loading while checking auth or context is not ready
  if (isCheckingAuth || !isContextReady) {
    console.log("⏳ SimpleRoleRouter: Showing initial loading...");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">
            {isCheckingAuth ? 'Checking authentication...' : 'Initializing...'}
          </p>
        </div>
      </div>
    );
  }

  // Show loading while checking role (only if authenticated)
  if (isAuthenticated && isCheckingRole) {
    console.log("🔍 SimpleRoleRouter: Showing role checking loading...");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Determining permissions...</p>
        </div>
      </div>
    );
  }

  // Show error with fallback options
  if (error) {
    console.log("❌ SimpleRoleRouter: Showing error:", error);
    return <ErrorFallback error={error} />;
  }

  // Show login prompt if not authenticated (this should now work!)
  if (!isAuthenticated) {
    console.log("🔐 SimpleRoleRouter: Showing login prompt");
    return <LoginPrompt organizationName={organizationName} isMainDomain={isMainDomainAccess} />;
  }

  // Route based on role and context
  console.log("🧭 SimpleRoleRouter: Routing user with role:", { 
    userRole, 
    isMainDomainAccess, 
    organizationId 
  });

  // Super admins get super admin dashboard
  if (userRole === 'super_admin') {
    console.log("🎯 SimpleRoleRouter: Rendering SuperAdminDashboard");
    return <SuperAdminDashboard />;
  }

  // Org admins get appropriate dashboard based on context
  if (userRole === 'org_admin') {
    if (organizationId) {
      console.log("🏢 SimpleRoleRouter: Rendering OrganizationDashboard for specific org:", organizationId);
      return <OrganizationDashboard />;
    } else if (isMainDomainAccess) {
      // On main domain, org admins can see the super admin dashboard to select organizations
      console.log("🏠 SimpleRoleRouter: Org admin on main domain, showing SuperAdminDashboard for org selection");
      return <SuperAdminDashboard />;
    } else {
      console.log("❌ SimpleRoleRouter: Org admin but no organization context");
      return <ErrorFallback error="No organization context available" />;
    }
  }

  // Regular users or users without proper access
  if (userRole === 'regular_user' || userRole === 'unknown') {
    console.log("🚫 SimpleRoleRouter: User has no dashboard access");
    return (
      <ErrorFallback 
        error="You don't have permission to access this dashboard" 
        showHomeButton={true}
      />
    );
  }

  // Fallback - should not reach here
  console.log("❓ SimpleRoleRouter: Unknown routing state - fallback");
  return <ErrorFallback error="Unknown routing state" />;
};

export default SimpleRoleRouter; 