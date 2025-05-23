
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useRedirectLogic = () => {
  const [redirectInProgress, setRedirectInProgress] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const redirectToUserDashboard = useCallback(async () => {
    if (redirectInProgress) return;
    setRedirectInProgress(true);
    
    try {
      console.log("Fetching user's organizations for redirect");
      
      // Use the more resilient function we created
      const { data: userOrgs, error: orgsError } = await supabase.rpc('rbac_fetch_user_organizations');
      
      if (orgsError) {
        console.error("Error fetching user organizations for redirect:", orgsError);
        toast({
          title: "Error",
          description: "Failed to load your organizations",
          variant: "destructive"
        });
        setRedirectInProgress(false);
        return;
      }
      
      console.log("User organizations for redirect:", userOrgs);
      
      // If user has any organizations, redirect to the tenant dashboard
      if (userOrgs && userOrgs.length > 0) {
        // If user has multiple organizations and is not a super admin,
        // redirect to the organization selection view
        if (userOrgs.length > 1) {
          console.log(`Redirecting to tenant dashboard selection view`);
          navigate(`/tenant-dashboard`);
          return;
        }
        
        // If just one organization, redirect directly to it
        const firstOrgId = userOrgs[0].id;
        console.log(`Redirecting to tenant dashboard for organization: ${firstOrgId}`);
        navigate(`/tenant-dashboard/${firstOrgId}`);
      } else {
        // If no organizations, redirect to auth page
        console.log("No organizations found for user, redirecting to auth page");
        toast({
          title: "No organizations found",
          description: "You don't have access to any organizations",
          variant: "destructive"
        });
        navigate('/auth');
      }
    } catch (err) {
      console.error("Redirect error:", err);
      setRedirectInProgress(false);
    }
  }, [navigate, toast, redirectInProgress]);

  // New function to open site builder in new window
  const openSiteBuilder = useCallback((orgId: string, pageId?: string) => {
    const url = pageId 
      ? `/page-builder/${pageId}` 
      : `/tenant-dashboard/${orgId}/page-builder`;
    
    window.open(url, '_blank', 'width=1200,height=800');
  }, []);

  return {
    redirectInProgress,
    redirectToUserDashboard,
    openSiteBuilder
  };
};
