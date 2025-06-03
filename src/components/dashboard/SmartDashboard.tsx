import React, { useEffect, useState, useRef } from 'react';
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
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const checkInProgressRef = useRef(false);

  // Add a timeout mechanism to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn("SmartDashboard: Loading timeout reached, forcing main dashboard");
      setLoadingTimeout(true);
      setDashboardType('main');
      setIsCheckingAuth(false);
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // Prevent multiple simultaneous executions
    if (!isContextReady || hasRedirected || checkInProgressRef.current || loadingTimeout) {
      console.log("SmartDashboard: Skipping check", { 
        isContextReady, 
        hasRedirected, 
        checkInProgress: checkInProgressRef.current,
        loadingTimeout 
      });
      return;
    }
    
    checkInProgressRef.current = true;
    
    const checkAuthAndDetermineType = async () => {
      try {
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
          return;
        }

        console.log("SmartDashboard: No org ID, no admin param. Main domain access:", isMainDomainAccess);

        // For main domain access, check if user is super admin
        if (isMainDomainAccess) {
          console.log("SmartDashboard: This IS main domain access, checking super admin status...");
          
          let isSuperAdmin = false;
          
          try {
            // Get current session first with timeout
            const sessionPromise = supabase.auth.getSession();
            const sessionResult = await Promise.race([
              sessionPromise,
              new Promise((_, reject) => setTimeout(() => reject(new Error('Session check timeout')), 5000))
            ]);
            
            const { data: sessionData } = sessionResult as any;
            
            if (!sessionData.session) {
              console.log("SmartDashboard: No session found, showing main dashboard");
              setDashboardType('main');
              return;
            }

            console.log("SmartDashboard: Session found, checking super admin status for user:", sessionData.session.user.email);
            
            // Simplified super admin check with timeout
            try {
              const adminCheckPromise = supabase.rpc('direct_super_admin_check');
              const adminResult = await Promise.race([
                adminCheckPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Admin check timeout')), 3000))
              ]);
              
              const { data: rpcResult, error: rpcError } = adminResult as any;
              
              if (!rpcError && rpcResult === true) {
                isSuperAdmin = true;
                console.log("SmartDashboard: RPC function confirms super admin status");
              } else {
                console.log("SmartDashboard: RPC function result:", { rpcResult, rpcError });
              }
            } catch (adminCheckError) {
              console.log("SmartDashboard: Admin check failed, defaulting to non-admin:", adminCheckError);
              // Don't throw, just continue as non-admin
            }
            
            console.log("SmartDashboard: Final super admin status:", isSuperAdmin);
            
            if (isSuperAdmin) {
              console.log("SmartDashboard: User IS super admin, redirecting to super admin dashboard");
              setHasRedirected(true);
              navigate('/dashboard?admin=true', { replace: true });
              return;
            } else {
              console.log("SmartDashboard: User is NOT super admin, showing main dashboard");
              setDashboardType('main');
            }
          } catch (sessionError) {
            console.error("SmartDashboard: Session error, defaulting to main dashboard:", sessionError);
            setDashboardType('main');
          }
        } else {
          console.log("SmartDashboard: This is NOT main domain access, showing subdomain dashboard");
          setDashboardType('subdomain');
        }
      } catch (error) {
        console.error("SmartDashboard: Critical error in checkAuthAndDetermineType, defaulting to main dashboard:", error);
        setDashboardType('main');
      } finally {
        // ALWAYS ensure these are set to prevent infinite loading
        setIsCheckingAuth(false);
        checkInProgressRef.current = false;
      }
    };

    checkAuthAndDetermineType();
  }, [isContextReady, location.search, navigate, contextError, hasRedirected, loadingTimeout]);

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
          <p className="text-sm text-gray-500 mt-2">
            {loadingTimeout ? 'Taking longer than expected...' : 'Checking permissions and routing...'}
          </p>
          {loadingTimeout && (
            <button 
              onClick={() => {
                setDashboardType('main');
                setIsCheckingAuth(false);
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Continue to Dashboard
            </button>
          )}
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
