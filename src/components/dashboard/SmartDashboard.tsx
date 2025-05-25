
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTenantContext } from '@/components/context/TenantContext';
import LoginDialog from '@/components/auth/LoginDialog';
import ChurchManagementDashboard from './ChurchManagementDashboard';

const SmartDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSubdomainAccess, organizationId, isContextReady } = useTenantContext();
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    if (!isContextReady) {
      console.log("SmartDashboard: Waiting for context to be ready");
      return;
    }
    
    console.log("SmartDashboard: Context ready, determining dashboard type", {
      isSubdomainAccess,
      organizationId,
      hostname: window.location.hostname
    });
    
    handleDashboardLogic();
  }, [isContextReady]);

  const handleDashboardLogic = async () => {
    try {
      // Check authentication first
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        console.log("SmartDashboard: User not authenticated, showing login dialog");
        setShowLoginDialog(true);
        setIsLoading(false);
        return;
      }

      console.log("SmartDashboard: User authenticated", {
        isSubdomainAccess,
        organizationId,
        userEmail: session.user.email
      });

      // CRITICAL: For subdomain access with organization context, render dashboard directly
      if (isSubdomainAccess && organizationId) {
        console.log("SmartDashboard: Subdomain access with org context - rendering dashboard directly");
        setIsLoading(false);
        return; // This will render ChurchManagementDashboard below
      }

      // For main domain access, handle redirect logic (original DashboardRedirect logic)
      console.log("SmartDashboard: Main domain access, checking user permissions");

      // Check if user is super admin
      const { data: isSuperAdminData, error: superAdminError } = await supabase.rpc('direct_super_admin_check');
      
      if (superAdminError) {
        console.error("SmartDashboard: Error checking super admin status:", superAdminError);
      }

      const isSuperAdmin = !!isSuperAdminData;
      console.log("SmartDashboard: Super admin status:", isSuperAdmin);

      // Fetch user's organizations
      const { data: userOrgs, error: orgsError } = await supabase.rpc('rbac_fetch_user_organizations');
      
      if (orgsError) {
        console.error("SmartDashboard: Error fetching user organizations:", orgsError);
        toast({
          title: "Error",
          description: "Failed to load your organizations",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      console.log("SmartDashboard: User organizations:", userOrgs);

      // Determine redirect destination for main domain
      if (isSuperAdmin) {
        if (userOrgs && userOrgs.length > 0) {
          console.log("SmartDashboard: Super admin with orgs, redirecting to tenant dashboard selection");
          navigate('/tenant-dashboard', { replace: true });
        } else {
          console.log("SmartDashboard: Super admin with no orgs, staying on root dashboard");
          navigate('/', { replace: true });
        }
      } else if (userOrgs && userOrgs.length > 0) {
        if (userOrgs.length === 1) {
          console.log("SmartDashboard: User with single org, redirecting to tenant dashboard");
          navigate(`/tenant-dashboard/${userOrgs[0].id}`, { replace: true });
        } else {
          console.log("SmartDashboard: User with multiple orgs, redirecting to selection");
          navigate('/tenant-dashboard', { replace: true });
        }
      } else {
        console.log("SmartDashboard: User with no organizations");
        toast({
          title: "No Organizations",
          description: "You don't have access to any organizations",
          variant: "destructive"
        });
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error("SmartDashboard: Error in dashboard logic:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center px-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (showLoginDialog) {
    return (
      <>
        <div className="flex items-center justify-center h-screen bg-white">
          <div className="text-center max-w-md p-6">
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="mb-4 text-gray-600">Please log in to access your dashboard.</p>
          </div>
        </div>
        <LoginDialog 
          isOpen={showLoginDialog} 
          setIsOpen={(open) => {
            setShowLoginDialog(open);
            if (!open) {
              window.location.reload();
            }
          }} 
        />
      </>
    );
  }

  // CRITICAL: For subdomain access with organization context, render dashboard directly
  if (isSubdomainAccess && organizationId) {
    console.log("SmartDashboard: Rendering subdomain dashboard for organization:", organizationId);
    return <ChurchManagementDashboard />;
  }

  // This should not be reached for subdomain access due to redirects above
  return null;
};

export default SmartDashboard;
