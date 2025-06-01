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
  const [hasRedirected, setHasRedirected] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isContextReady || hasRedirected) {
      console.log("SmartDashboard: Waiting for context or already redirected", { isContextReady, hasRedirected });
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
        contextError,
        currentURL: window.location.href
      });
      
      // If we have an org parameter, redirect to the new organization dashboard route
      if (orgId && orgId !== 'undefined' && orgId !== 'null') {
        console.log("SmartDashboard: Redirecting to organization dashboard", orgId);
        setHasRedirected(true);
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
          // Get current session first
          const { data: sessionData } = await supabase.auth.getSession();
          if (!sessionData.session) {
            console.log("SmartDashboard: No session found, showing main dashboard");
            setDashboardType('main');
            setIsCheckingAuth(false);
            return;
          }

          console.log("SmartDashboard: Session found, checking super admin status for user:", sessionData.session.user.email);
          
          // Check super admin status with multiple methods
          let isSuperAdmin = false;
          
          // Method 1: Try the RPC function first
          console.log("SmartDashboard: Method 1 - Trying RPC function...");
          try {
            const { data: rpcResult, error: rpcError } = await supabase.rpc('direct_super_admin_check');
            if (!rpcError && rpcResult === true) {
              isSuperAdmin = true;
              console.log("SmartDashboard: RPC function confirms super admin status");
            } else {
              console.log("SmartDashboard: RPC function result:", { rpcResult, rpcError });
            }
          } catch (rpcException) {
            console.log("SmartDashboard: RPC function failed:", rpcException);
          }
          
          // Method 2: If RPC didn't work, try direct table query
          if (!isSuperAdmin) {
            console.log("SmartDashboard: Method 2 - Trying direct table query...");
            const { data: memberData, error: memberError } = await supabase
              .from('organization_members')
              .select('role')
              .eq('user_id', sessionData.session.user.id)
              .eq('role', 'super_admin')
              .limit(1);
            
            if (!memberError && memberData && memberData.length > 0) {
              isSuperAdmin = true;
              console.log("SmartDashboard: Direct table query confirms super admin status");
            } else {
              console.log("SmartDashboard: Direct table query result:", { memberData, memberError });
            }
          }
          
          // Method 3: Check users table directly as final fallback
          if (!isSuperAdmin) {
            console.log("SmartDashboard: Method 3 - Checking users table...");
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('role')
              .eq('id', sessionData.session.user.id)
              .single();
            
            if (!userError && userData && userData.role === 'super_admin') {
              isSuperAdmin = true;
              console.log("SmartDashboard: Users table confirms super admin status");
            } else {
              console.log("SmartDashboard: Users table result:", { userData, userError });
            }
          }
          
          console.log("SmartDashboard: Final super admin status:", isSuperAdmin);
          
          if (isSuperAdmin) {
            console.log("SmartDashboard: User IS super admin, redirecting to super admin dashboard");
            console.log("SmartDashboard: About to navigate to /dashboard?admin=true");
            setHasRedirected(true);
            navigate('/dashboard?admin=true', { replace: true });
            return;
          } else {
            console.log("SmartDashboard: User is NOT super admin, showing main dashboard");
            setDashboardType('main');
          }
        } catch (error) {
          console.error("SmartDashboard: Exception in super admin check:", error);
          setDashboardType('main');
        }
      } else {
        console.log("SmartDashboard: This is NOT main domain access, showing subdomain dashboard");
        setDashboardType('subdomain');
      }
      
      setIsCheckingAuth(false);
    };

    checkAuthAndDetermineType();
  }, [isContextReady, location.search, navigate, contextError, hasRedirected]);

  // Handle context errors
  if (contextError) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center px-4">
          <div className="text-red-500 mb-4">
            <h2 className="text-xl font-semibold">Context Error</h2>
            <p className="text-sm mt-2">{contextError}</p>
          </div>
          <button 
            onClick={retryContext}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show loading while determining dashboard type
  if (!dashboardType || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center px-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-lg font-medium">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Checking permissions and routing...</p>
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
