
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DashboardAuthState {
  isAuthenticated: boolean;
  hasAccess: boolean;
  loading: boolean;
}

export const useDashboardAuth = (organizationId: string | undefined) => {
  const [authState, setAuthState] = useState<DashboardAuthState>({
    isAuthenticated: false,
    hasAccess: false,
    loading: true
  });
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndAccess();
  }, [organizationId]);

  const checkAuthAndAccess = async () => {
    try {
      // Check authentication
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        console.log("No authenticated session found");
        setAuthState({ isAuthenticated: false, hasAccess: false, loading: false });
        return;
      }

      if (!organizationId) {
        console.log("No organization ID available");
        setAuthState({ isAuthenticated: true, hasAccess: false, loading: false });
        return;
      }

      console.log("Checking access for organization:", organizationId);

      // Check if user is super admin first
      const { data: isSuperAdmin } = await supabase.rpc('direct_super_admin_check');
      
      let hasOrgAccess = false;
      
      if (isSuperAdmin) {
        console.log("User is super admin, granting access");
        hasOrgAccess = true;
      } else {
        // Check if user is a member of this organization
        const { data: memberData } = await supabase
          .from('organization_members')
          .select('role')
          .eq('organization_id', organizationId)
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
      console.error('Error in checkAuthAndAccess:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      setAuthState({ isAuthenticated: false, hasAccess: false, loading: false });
    }
  };

  return authState;
};
