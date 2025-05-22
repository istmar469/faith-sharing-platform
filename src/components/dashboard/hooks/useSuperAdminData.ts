import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { OrganizationData } from '../types';

/**
 * Custom hook for fetching and managing super admin data
 */
export const useSuperAdminData = () => {
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAllowed, setIsAllowed] = useState(false);
  const [statusChecked, setStatusChecked] = useState(false);
  const { toast } = useToast();

  // Check if user is a super admin
  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      try {
        // First check if user is authenticated
        const { data: session } = await supabase.auth.getSession();
        
        if (!session.session) {
          console.log("No active session found");
          setStatusChecked(true);
          return;
        }

        const { data, error } = await supabase
          .rpc('get_single_super_admin_status');

        if (error) {
          console.error("Error checking super admin status:", error);
          toast({
            title: "Authentication Error",
            description: "Could not verify your admin status",
            variant: "destructive"
          });
          setError(error.message);
          setIsAllowed(false);
          setStatusChecked(true);
          return;
        }

        console.log("Super admin status response:", data);
        
        // Check if data is an object with is_super_admin property
        if (data && typeof data === 'object' && 'is_super_admin' in data) {
          setIsAllowed(!!data.is_super_admin);
          if (data.is_super_admin) {
            fetchOrganizations();
          } else {
            toast({
              title: "Access Denied",
              description: "You don't have super admin privileges",
              variant: "destructive"
            });
          }
        } else {
          setIsAllowed(false);
          toast({
            title: "Access Denied",
            description: "You don't have super admin privileges",
            variant: "destructive"
          });
        }
        setStatusChecked(true);
      } catch (err) {
        console.error("Exception in super admin check:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatusChecked(true);
      }
    };

    checkSuperAdminStatus();
  }, [toast]);

  // Fetch all organizations if user is super admin
  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      // First try the special super admin function
      const { data, error } = await supabase
        .rpc('get_all_organizations_for_super_admin');
        
      if (error) {
        console.error("Error fetching organizations via RPC:", error);
        toast({
          title: "Error",
          description: "Failed to fetch organizations. Trying fallback method.",
          variant: "destructive"
        });
        
        // Fallback to direct table query
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('organizations')
          .select('*');
          
        if (fallbackError) {
          throw new Error(fallbackError.message);
        }
        
        if (fallbackData) {
          const orgsWithAddedFields = fallbackData.map(org => ({
            ...org,
            role: 'super_admin', // Add role since we know they're super admin
            // Make sure all required fields exist
            subdomain: org.subdomain || null,
            description: org.description || null,
            website_enabled: org.website_enabled || false,
            slug: org.slug || '',
            custom_domain: org.custom_domain || null
          }));
          setOrganizations(orgsWithAddedFields);
        }
      } else if (data) {
        console.log("Organizations fetched:", data);
        
        // Map the data to ensure all required fields exist
        const fullOrgData = data.map(org => {
          // Create base organization with default values for all required fields
          const baseOrg: OrganizationData = {
            id: org.id,
            name: org.name,
            subdomain: null,
            description: null,
            website_enabled: false,
            slug: '',
            custom_domain: null,
            role: org.role || 'super_admin'
          };
          
          // Copy any additional fields that exist in the response
          return { ...baseOrg, ...org };
        });
        
        setOrganizations(fullOrgData);
      }
    } catch (err) {
      console.error("Error fetching organizations:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch organizations");
      toast({
        title: "Error",
        description: "Could not load organizations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    organizations,
    loading,
    error,
    isAllowed,
    statusChecked,
    fetchOrganizations,
  };
};
