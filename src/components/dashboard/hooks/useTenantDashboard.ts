import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      
      // Fetch user's organizations
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select(`
          id,
          name,
          subdomain,
          custom_domain,
          organization_members!inner(role)
        `)
        .eq('organization_members.user_id', userData.user.id);
      
      if (orgsError) {
        console.error("Error fetching organizations:", orgsError);
        setError("Failed to load your organizations");
        setIsLoading(false);
        return;
      }
      
      // Check if user is super admin
      const { data: superAdminData, error: superAdminError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', userData.user.id)
        .eq('role', 'super_admin')
        .maybeSingle();
      
      setIsSuperAdmin(!!superAdminData);
      
      // Process organizations data
      const organizations = orgsData?.map(org => ({
        id: org.id,
        name: org.name,
        subdomain: org.subdomain,
        custom_domain: org.custom_domain,
        role: org.organization_members[0]?.role || 'member'
      })) || [];
      
      setUserOrganizations(organizations);
      
      // Handle redirection based on number of organizations
      if (organizations.length === 0) {
        toast({
          title: "No organizations found",
          description: "You don't have access to any organizations",
          variant: "destructive"
        });
      } else if (organizations.length === 1 && !isSuperAdmin) {
        // Redirect to the only organization dashboard
        navigate(`/tenant-dashboard/${organizations[0].id}`);
      }
      // Otherwise, stay on this page to let the user select an organization
      
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthAndFetchOrgs();
  }, []);

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
