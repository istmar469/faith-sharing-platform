
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import LoginDialog from '@/components/auth/LoginDialog';
import OrganizationSelection from './OrganizationSelection';
import { Organization } from './hooks/useTenantDashboard';

const MainDomainDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, isCheckingAuth } = useAuthStatus();
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (isCheckingAuth) return;

      if (!isAuthenticated) {
        console.log("MainDomainDashboard: User not authenticated, showing login dialog");
        setShowLoginDialog(true);
        setIsLoading(false);
        return;
      }

      try {
        console.log("MainDomainDashboard: User authenticated, checking permissions");
        
        // Check if user is super admin
        const { data: isSuperAdminData } = await supabase.rpc('direct_super_admin_check');
        const superAdmin = !!isSuperAdminData;
        setIsSuperAdmin(superAdmin);
        
        // Fetch user's organizations
        const { data: orgsData, error: orgsError } = await supabase.rpc('rbac_fetch_user_organizations');
        
        if (orgsError) {
          console.error("MainDomainDashboard: Error fetching organizations:", orgsError);
          toast({
            title: "Error",
            description: "Failed to load your organizations",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        const organizations = orgsData || [];
        setUserOrganizations(organizations);

        console.log("MainDomainDashboard: User status", {
          isSuperAdmin: superAdmin,
          organizationCount: organizations.length
        });

        // Determine redirect logic
        if (superAdmin) {
          if (organizations.length > 0) {
            console.log("MainDomainDashboard: Super admin with orgs, staying on selection page");
          } else {
            console.log("MainDomainDashboard: Super admin with no orgs, redirecting to root");
            navigate('/', { replace: true });
            return;
          }
        } else if (organizations.length === 1) {
          console.log("MainDomainDashboard: User with single org, redirecting to tenant dashboard");
          navigate(`/tenant-dashboard/${organizations[0].id}`, { replace: true });
          return;
        } else if (organizations.length === 0) {
          console.log("MainDomainDashboard: User with no organizations");
          toast({
            title: "No Organizations",
            description: "You don't have access to any organizations",
            variant: "destructive"
          });
          navigate('/', { replace: true });
          return;
        }
      } catch (error) {
        console.error("MainDomainDashboard: Error in auth check:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndRedirect();
  }, [isAuthenticated, isCheckingAuth, navigate, toast]);

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

  // Show organization selection for users with multiple orgs or super admins
  return (
    <OrganizationSelection 
      userOrganizations={userOrganizations} 
      isSuperAdmin={isSuperAdmin} 
    />
  );
};

export default MainDomainDashboard;
