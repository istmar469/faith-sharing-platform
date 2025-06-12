import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTenantContext } from '@/components/context/TenantContext';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import LoginDialog from '@/components/auth/LoginDialog';
import ChurchManagementDashboard from './ChurchManagementDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';
import { supabase } from '@/integrations/supabase/client';
import { isSuperAdmin } from '@/utils/superAdminCheck';

const SubdomainDashboard: React.FC = () => {
  const { organizationId, organizationName, isContextReady, isSubdomainAccess } = useTenantContext();
  const { isAuthenticated, isCheckingAuth } = useAuthStatus();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [orgVerified, setOrgVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check super admin status
  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      if (!isAuthenticated) {
        console.log("SubdomainDashboard: Not authenticated, skipping super admin check");
        setIsSuperAdminUser(false);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log("SubdomainDashboard: Checking super admin status for user:", isAuthenticated);
        
        // Use unified super admin check
        const result = await isSuperAdmin();
        console.log("SubdomainDashboard: Super admin check result:", result);
        
        setIsSuperAdminUser(!!result);
      } catch (error) {
        console.error("SubdomainDashboard: Error checking super admin status:", error);
        setIsSuperAdminUser(false);
      } finally {
        setLoading(false);
      }
    };

    checkSuperAdminStatus();
  }, [isAuthenticated]);

  // Verify organization exists and is properly configured
  useEffect(() => {
    const verifyOrganization = async () => {
      if (!organizationId || !isContextReady) return;

      try {
        console.log("SubdomainDashboard: Verifying organization", organizationId);
        
        const { data: org, error } = await supabase
          .from('organizations')
          .select('id, name, website_enabled, subdomain')
          .eq('id', organizationId)
          .single();

        if (error) {
          console.error("SubdomainDashboard: Organization verification failed", error);
          setVerificationError(`Organization verification failed: ${error.message}`);
          return;
        }

        if (!org) {
          setVerificationError("Organization not found");
          return;
        }

        if (!org.website_enabled) {
          setVerificationError(`${org.name}'s website is currently disabled`);
          return;
        }

        console.log("SubdomainDashboard: Organization verified successfully", org);
        setOrgVerified(true);
      } catch (error) {
        console.error("SubdomainDashboard: Unexpected error during verification", error);
        setVerificationError("Unexpected error during organization verification");
      }
    };

    verifyOrganization();
  }, [organizationId, isContextReady]);

  // Show loading while checking auth or context
  if (!isContextReady || isCheckingAuth || isSuperAdmin === null || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center px-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-lg font-medium">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">
            {!isContextReady ? 'Initializing organization context...' : 
             isCheckingAuth ? 'Checking authentication...' : 
             'Checking permissions...'}
          </p>
        </div>
      </div>
    );
  }

  // If user is super admin, show super admin dashboard regardless of subdomain access
  if (isSuperAdminUser) {
    console.log("SubdomainDashboard: Showing SuperAdminDashboard for super admin user");
    return <SuperAdminDashboard />;
  }

  // Show error if not subdomain access and not super admin
  if (!isSubdomainAccess) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center max-w-md p-6">
          <h2 className="text-2xl font-bold mb-2 text-red-600">Invalid Access</h2>
          <p className="mb-4 text-gray-600">This dashboard is only available via subdomain access.</p>
          <button
            onClick={() => window.location.href = 'https://church-os.com'}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Go to Main Site
          </button>
        </div>
      </div>
    );
  }

  // Show error if organization verification failed
  if (verificationError) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center max-w-md p-6">
          <h2 className="text-2xl font-bold mb-2 text-red-600">Organization Error</h2>
          <p className="mb-4 text-gray-600">{verificationError}</p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
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

  // Show loading while verifying organization
  if (!orgVerified) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center px-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-lg font-medium">Verifying organization...</p>
          <p className="text-sm text-gray-500 mt-2">{organizationName}</p>
        </div>
      </div>
    );
  }

  // Show login dialog if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <div className="flex items-center justify-center h-screen bg-white">
          <div className="text-center max-w-md p-6">
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="mb-4 text-gray-600">
              Please log in to access the {organizationName} dashboard.
            </p>
            <button
              onClick={() => setShowLoginDialog(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              Sign In
            </button>
          </div>
        </div>
        <LoginDialog 
          isOpen={showLoginDialog} 
          setIsOpen={setShowLoginDialog} 
        />
      </>
    );
  }

  // Render the main dashboard
  console.log("SubdomainDashboard: Rendering main dashboard for", organizationName);
  return <ChurchManagementDashboard />;
};

export default SubdomainDashboard;
