
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import LoginDialog from '@/components/auth/LoginDialog';
import OrganizationSelection from './OrganizationSelection';
import { Organization } from './hooks/useTenantDashboard';

const MainDomainDashboard: React.FC = () => {
  const { toast } = useToast();
  const { isAuthenticated, isCheckingAuth } = useAuthStatus();
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      if (isCheckingAuth) return;

      if (!isAuthenticated) {
        console.log("MainDomainDashboard: User not authenticated, showing login dialog");
        setShowLoginDialog(true);
        setIsLoading(false);
        return;
      }

      try {
        console.log("MainDomainDashboard: User authenticated, loading data");
        
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

        console.log("MainDomainDashboard: Data loaded successfully", {
          isSuperAdmin: superAdmin,
          organizationCount: organizations.length
        });

      } catch (error) {
        console.error("MainDomainDashboard: Error loading data:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [isAuthenticated, isCheckingAuth, toast]);

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

  // Show organization selection for authenticated users
  return (
    <OrganizationSelection 
      userOrganizations={userOrganizations} 
      isSuperAdmin={isSuperAdmin} 
    />
  );
};

export default MainDomainDashboard;
