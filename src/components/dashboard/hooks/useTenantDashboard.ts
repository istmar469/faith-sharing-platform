
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface Organization {
  id: string;
  name: string;
  role: string;
  subdomain?: string;
  custom_domain?: string;
}

export const useTenantDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  
  const showComingSoonToast = () => {
    toast({
      title: "Coming Soon",
      description: "This feature is under development",
    });
  };

  const checkAuthAndFetchOrgs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        console.log("User not authenticated, showing login dialog");
        setLoginDialogOpen(true);
        setIsLoading(false);
        return;
      }
      
      console.log("User authenticated, checking super admin status");
      
      // Check if the user is a super admin using direct_super_admin_check function
      const { data: isSuperAdminData, error: superAdminError } = await supabase.rpc('direct_super_admin_check');
      
      if (superAdminError) {
        console.error("Error checking super admin status:", superAdminError);
      } else {
        console.log("Super admin check result:", isSuperAdminData);
        setIsSuperAdmin(!!isSuperAdminData);
      }
      
      // Fetch user's organizations using the more resilient function
      const { data: orgsData, error: orgsError } = await supabase.rpc('rbac_fetch_user_organizations');
      
      if (orgsError) {
        console.error("Error fetching organizations:", orgsError);
        setError("Failed to load your organizations");
        setIsLoading(false);
        return;
      }
      
      console.log("Fetched organizations:", orgsData);
      
      // Process organizations data
      setUserOrganizations(orgsData || []);
      
      // Important routing logic based on user type and context
      const currentOrgId = params.organizationId;
      
      // Super admin without specific org ID should go to super admin dashboard
      if (isSuperAdminData && !currentOrgId) {
        console.log("Super admin without org ID - redirecting to super admin dashboard");
        navigate('/dashboard');
        return;
      } 
      // Super admin with org ID - continue to render tenant view for that org
      else if (isSuperAdminData && currentOrgId) {
        console.log("Super admin viewing specific org:", currentOrgId);
        // Stay on this page with the specific org
      }
      // Regular user with multiple orgs and no specific one selected
      else if (orgsData && orgsData.length > 1 && !currentOrgId) {
        console.log("Regular user with multiple orgs - showing selection");
        // Stay on this page to show org selection
      }
      // Regular user with exactly one org - redirect to that org
      else if (orgsData && orgsData.length === 1 && !currentOrgId) {
        console.log("Single org user - redirecting to only org");
        navigate(`/tenant-dashboard/${orgsData[0].id}`);
      }
      // No orgs found
      else if ((!orgsData || orgsData.length === 0) && !currentOrgId) {
        toast({
          title: "No organizations found",
          description: "You don't have access to any organizations",
          variant: "destructive"
        });
      }
      
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthAndFetchOrgs();
  }, [params.organizationId]);

  return {
    isLoading,
    error,
    userOrganizations,
    isSuperAdmin,
    loginDialogOpen,
    setLoginDialogOpen,
    showComingSoonToast,
    checkAuthAndFetchOrgs
  };
};

export type { Organization };
