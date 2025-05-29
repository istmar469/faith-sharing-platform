import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTenantContext } from '@/components/context/TenantContext';
import { isMainDomain } from '@/utils/domain';
import { supabase } from '@/integrations/supabase/client';
import SubdomainDashboard from './SubdomainDashboard';
import MainDomainDashboard from './MainDomainDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';

const SmartDashboard: React.FC = () => {
  const { isContextReady, contextError, retryContext } = useTenantContext();
  const [dashboardType, setDashboardType] = useState<'main' | 'subdomain' | 'superadmin' | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isContextReady) {
      console.log("SmartDashboard: Waiting for context to be ready");
      return;
    }
    
    const checkAuthAndDetermineType = async () => {
      const hostname = window.location.hostname;
      const isMainDomainAccess = isMainDomain(hostname);
      const urlParams = new URLSearchParams(location.search);
      const orgId = urlParams.get('org');
      const isAdmin = urlParams.get('admin') === 'true';
      
      console.log("SmartDashboard: Context ready, determining dashboard type", {
        hostname,
        isMainDomainAccess,
        orgId,
        isAdmin,
        contextError
      });
      
      // If we have an org parameter, redirect to the new organization dashboard route
      if (orgId && orgId !== 'undefined' && orgId !== 'null') {
        console.log("SmartDashboard: Redirecting to organization dashboard", orgId);
        navigate(`/dashboard/${orgId}`, { replace: true });
        return;
      }
      
      // If admin parameter is true, show super admin dashboard directly
      if (isAdmin) {
        console.log("SmartDashboard: Admin parameter is true, showing super admin dashboard");
        setDashboardType('superadmin');
        setIsCheckingAuth(false);
        return;
      }

      console.log("SmartDashboard: No org ID, no admin param. Main domain access:", isMainDomainAccess);

      // For main domain access, check if user is super admin
      if (isMainDomainAccess) {
        console.log("SmartDashboard: This IS main domain access, checking super admin status...");
        try {
          // First, let's test if the function exists
          console.log("SmartDashboard: Testing if direct_super_admin_check function exists...");
          
          console.log("SmartDashboard: About to call direct_super_admin_check");
          const { data: isSuperAdmin, error } = await supabase.rpc('direct_super_admin_check');
          
          console.log("SmartDashboard: direct_super_admin_check response:", { isSuperAdmin, error });
          
          if (error) {
            console.error("SmartDashboard: Error checking super admin status:", error);
            
            // If function doesn't exist, let's try alternative method
            if (error.message?.includes('function') || error.code === '42883') {
              console.log("SmartDashboard: Function doesn't exist, trying alternative super admin check...");
              
              // Alternative: Check organization_members table directly
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                console.log("SmartDashboard: Checking organization_members for user:", session.user.email);
                console.log("SmartDashboard: Session user ID:", session.user.id);
                
                // First, let's see ALL memberships for this user
                const { data: allMemberData, error: allMemberError } = await supabase
                  .from('organization_members')
                  .select('*')
                  .eq('user_id', session.user.id);
                
                console.log("SmartDashboard: ALL memberships for this user:", { allMemberData, allMemberError });
                
                const { data: memberData, error: memberError } = await supabase
                  .from('organization_members')
                  .select('role, organization_id')
                  .eq('user_id', session.user.id)
                  .eq('role', 'super_admin');
                
                console.log("SmartDashboard: Alternative super admin check:", { memberData, memberError });
                
                if (memberError) {
                  console.error("SmartDashboard: Error checking organization members:", memberError);
                } else if (memberData && memberData.length > 0) {
                  console.log("SmartDashboard: User IS super admin (alternative method), found", memberData.length, "super_admin roles");
                  navigate('/dashboard?admin=true', { replace: true });
                  return;
                } else {
                  console.log("SmartDashboard: User has NO super_admin roles in any organization");
                }
              } else {
                console.log("SmartDashboard: No session found");
              }
            }
          } else {
            console.log("SmartDashboard: Super admin check result:", isSuperAdmin);
            
            if (isSuperAdmin) {
              console.log("SmartDashboard: User IS super admin, redirecting to super admin dashboard");
              // User is super admin, redirect to super admin dashboard
              navigate('/dashboard?admin=true', { replace: true });
              return;
            } else {
              console.log("SmartDashboard: User is NOT super admin (via RPC), trying alternative check...");
              
              // Double-check with direct database query
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                console.log("SmartDashboard: Fallback check for user:", session.user.email);
                console.log("SmartDashboard: Session user ID:", session.user.id);
                
                // First, let's see ALL memberships for this user
                const { data: allMemberData, error: allMemberError } = await supabase
                  .from('organization_members')
                  .select('*')
                  .eq('user_id', session.user.id);
                
                console.log("SmartDashboard: ALL memberships for this user:", { allMemberData, allMemberError });
                
                // Now check specifically for super_admin role
                const { data: memberData, error: memberError } = await supabase
                  .from('organization_members')
                  .select('role, organization_id')
                  .eq('user_id', session.user.id)
                  .eq('role', 'super_admin');
                
                console.log("SmartDashboard: Fallback super admin check:", { memberData, memberError });
                
                if (memberData && memberData.length > 0) {
                  console.log("SmartDashboard: User IS super admin (fallback method), found", memberData.length, "super_admin roles");
                  navigate('/dashboard?admin=true', { replace: true });
                  return;
                } else {
                  console.log("SmartDashboard: Confirmed: User has NO super_admin roles, showing organization selection");
                }
              }
            }
          }
        } catch (error) {
          console.error("SmartDashboard: Exception in super admin check:", error);
        }
      } else {
        console.log("SmartDashboard: This is NOT main domain access, skipping super admin check");
      }
      
      // Otherwise determine by domain (fallback for non-super admin users)
      setDashboardType(isMainDomainAccess ? 'main' : 'subdomain');
      setIsCheckingAuth(false);
    };

    checkAuthAndDetermineType();
  }, [isContextReady, contextError, location.search, navigate]);

  // Show loading while context is initializing or checking auth
  if (!isContextReady || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center px-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-lg font-medium">
            {!isContextReady ? 'Initializing dashboard...' : 'Checking permissions...'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {!isContextReady ? 'Determining organization context...' : 'Verifying access level...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error if context initialization failed
  if (contextError) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center max-w-md p-6">
          <h2 className="text-2xl font-bold mb-2 text-red-600">Context Error</h2>
          <p className="mb-4 text-gray-600">{contextError}</p>
          <div className="space-y-2">
            <button
              onClick={retryContext}
              className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.href = 'https://church-os.com'}
              className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Go to Main Site
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while determining dashboard type
  if (!dashboardType) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center px-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-lg font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on access type
  console.log("SmartDashboard: Rendering dashboard type:", dashboardType);
  
  if (dashboardType === 'superadmin') {
    return <SuperAdminDashboard />;
  } else if (dashboardType === 'main') {
    return <MainDomainDashboard />;
  } else {
    return <SubdomainDashboard />;
  }
};

export default SmartDashboard;
