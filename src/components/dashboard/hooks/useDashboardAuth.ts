import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { isSuperAdmin } from '@/utils/superAdminCheck';
import { useToast } from '@/hooks/use-toast';

export interface DashboardAuthState {
  isAuthenticated: boolean;
  hasAccess: boolean;
  loading: boolean;
}

export const useDashboardAuth = () => {
  const { user, loading: authLoading } = useAuthContext();
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [userOrganizations, setUserOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<DashboardAuthState>({
    isAuthenticated: false,
    hasAccess: false,
    loading: true
  });
  const { toast } = useToast();

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Use unified super admin check
        const adminStatus = await isSuperAdmin();
        setIsSuperAdminUser(adminStatus);

        // Check authentication
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError || !session) {
          console.log("No authenticated session found");
          setAuthState({ isAuthenticated: false, hasAccess: false, loading: false });
          return;
        }

        console.log("Checking access for organization:", session.user.organizations[0]);

        let hasOrgAccess = false;
        
        if (adminStatus) {
          console.log("User is super admin, granting access");
          hasOrgAccess = true;
        } else {
          // Check if user is a member of this organization
          const { data: memberData } = await supabase
            .from('organization_members')
            .select('role')
            .eq('organization_id', session.user.organizations[0])
            .eq('user_id', session.user.id)
            .single();

          if (memberData) {
            console.log("User has membership:", memberData.role);
            hasOrgAccess = true;
          } else {
            console.log("User does not have access to this organization");
          }
        }

        if (!hasOrgAccess) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this organization.",
            variant: "destructive"
          });
        }

        setAuthState({
          isAuthenticated: true,
          hasAccess: hasOrgAccess,
          loading: false
        });

      } catch (error) {
        console.error('Error checking user status:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkUserStatus();
    }
  }, [user, authLoading]);

  return {
    user,
    isSuperAdminUser,
    userOrganizations,
    loading: authLoading || loading,
    authState
  };
};
