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
        
        // Get current session to get user ID
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          console.log("MainDomainDashboard: No session found");
          setShowLoginDialog(true);
          setIsLoading(false);
          return;
        }

        const userId = sessionData.session.user.id;
        console.log("MainDomainDashboard: User ID:", userId);
        
        // Check if user is super admin (direct query)
        const { data: superAdminCheck } = await supabase
          .from('organization_members')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'super_admin')
          .limit(1);
        
        const isSuperAdminUser = superAdminCheck && superAdminCheck.length > 0;
        setIsSuperAdmin(isSuperAdminUser);
        
        console.log("MainDomainDashboard: Super admin status:", isSuperAdminUser);
        
        // Fetch user's organizations with direct query
        const { data: orgsData, error: orgsError } = await supabase
          .from('organization_members')
          .select(`
            role,
            organization_id,
            organizations!inner (
              id,
              name,
              subdomain,
              website_enabled,
              current_tier,
              subscription_status
            )
          `)
          .eq('user_id', userId);
        
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

        // Transform the data to match expected format
        const organizations = (orgsData || []).map(item => ({
          id: item.organizations.id,
          name: item.organizations.name,
          subdomain: item.organizations.subdomain,
          website_enabled: item.organizations.website_enabled,
          current_tier: item.organizations.current_tier,
          subscription_status: item.organizations.subscription_status,
          role: item.role
        }));

        setUserOrganizations(organizations);

        console.log("MainDomainDashboard: Data loaded successfully", {
          isSuperAdmin: isSuperAdminUser,
          organizationCount: organizations.length,
          organizations: organizations
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
