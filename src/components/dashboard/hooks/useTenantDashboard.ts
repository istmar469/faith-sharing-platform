import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { isSuperAdmin } from '@/utils/superAdminCheck';

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
      
      console.log("User authenticated:", userData.user.email);
      
      // Use unified super admin check
      const isSuperAdminData = await isSuperAdmin();
      
      if (isSuperAdminData) {
        console.log("useTenantDashboard: User is super admin");
        setIsSuperAdmin(true);
        
        // Fetch user's organizations using the more resilient function
        const { data: orgsData, error: orgsError } = await supabase.rpc('rbac_fetch_user_organizations');
        
        if (orgsError) {
          console.error("Error fetching organizations:", orgsError);
          setError("Failed to load your organizations. Please try again.");
          setIsLoading(false);
          return;
        }
        
        console.log("Fetched organizations:", orgsData);
        
        // Process organizations data - if super admin, set all roles to super_admin
        if (orgsData) {
          const processedOrgs = orgsData.map(org => ({
            ...org,
            role: 'super_admin' // Override all roles to super_admin for super admins
          }));
          setUserOrganizations(processedOrgs || []);
        } else {
          setUserOrganizations(orgsData || []);
        }
        
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
              
              // Add the role property as super_admin for super admins
              setCurrentOrganization({
                ...orgData,
                role: 'super_admin'
              });
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
              
              // If they have other organizations, we'll redirect in the component
              if (orgsData && orgsData.length > 0) {
                toast({
                  title: "Access Denied",
                  description: "You don't have access to that organization",
                  variant: "destructive"
                });
              }
            }
          }
        }
      } else {
        // Fetch user's organizations using the more resilient function
        const { data: orgsData, error: orgsError } = await supabase.rpc('rbac_fetch_user_organizations');
        
        if (orgsError) {
          console.error("Error fetching organizations:", orgsError);
          setError("Failed to load your organizations. Please try again.");
          setIsLoading(false);
          return;
        }
        
        console.log("Fetched organizations:", orgsData);
        
        setUserOrganizations(orgsData || []);
        
        // Important: If we have a specific organization ID in the URL, fetch that organization's details
        const currentOrgId = params.organizationId;
        
        if (currentOrgId) {
          console.log("Looking for organization with ID:", currentOrgId);
          
          // If regular user, check if they have access to this organization
          const matchingOrg = orgsData?.find(org => org.id === currentOrgId);
          
          if (matchingOrg) {
            console.log("User has access to this organization:", matchingOrg);
            setCurrentOrganization(matchingOrg);
          } else {
            console.error("User does not have access to this organization");
            setError("You do not have access to this organization");
            
            // If they have other organizations, we'll redirect in the component
            if (orgsData && orgsData.length > 0) {
              toast({
                title: "Access Denied",
                description: "You don't have access to that organization",
                variant: "destructive"
              });
            }
          }
        }
      }
      
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
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
