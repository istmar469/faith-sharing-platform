
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
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  
  const showComingSoonToast = () => {
    toast({
      title: "Coming Soon",
      description: "This feature is under development",
    });
  };

  const checkAuthAndFetchOrgs = async () => {
    setIsLoading(true);
    setError(null);
    console.log("TenantDashboard: Checking auth and fetching orgs with ID param:", params.organizationId);
    
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
      
      // Important: If we have a specific organization ID in the URL, fetch that organization's details
      const currentOrgId = params.organizationId;
      
      if (currentOrgId) {
        console.log("Looking for organization with ID:", currentOrgId);
        
        // If super admin, fetch any organization regardless of membership
        if (isSuperAdminData) {
          console.log("Super admin fetching specific org:", currentOrgId);
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', currentOrgId)
            .single();
            
          if (orgError) {
            console.error("Error fetching organization details:", orgError);
            setError("Failed to load organization details");
          } else if (orgData) {
            console.log("Found organization details:", orgData);
            setCurrentOrganization(orgData);
          }
        } 
        // If regular user, check if they have access to this organization
        else {
          const matchingOrg = orgsData?.find(org => org.id === currentOrgId);
          
          if (matchingOrg) {
            console.log("User has access to this organization:", matchingOrg);
            setCurrentOrganization(matchingOrg);
          } else {
            console.error("User does not have access to this organization");
            setError("You do not have access to this organization");
            // Redirect to organization selection if they have other orgs
            if (orgsData && orgsData.length > 0) {
              toast({
                title: "Access Denied",
                description: "You don't have access to that organization",
                variant: "destructive"
              });
              navigate('/tenant-dashboard');
            }
          }
        }
      }
      // Super admin without specific org ID should go to super admin dashboard
      else if (isSuperAdminData && !currentOrgId) {
        console.log("Super admin without org ID - redirecting to super admin dashboard");
        navigate('/dashboard');
        return;
      } 
      // Regular user with multiple orgs and no specific one selected - stay on this page to show org selection
      else if (orgsData && orgsData.length > 1 && !currentOrgId) {
        console.log("Regular user with multiple orgs - showing selection");
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
    currentOrganization,
    isSuperAdmin,
    loginDialogOpen,
    setLoginDialogOpen,
    showComingSoonToast,
    checkAuthAndFetchOrgs
  };
};

export type { Organization };
