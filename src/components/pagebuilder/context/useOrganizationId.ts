
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useOrganizationId = (initialOrgId: string | null = null) => {
  const [organizationId, setOrganizationId] = useState<string | null>(initialOrgId);
  const [searchParams] = useSearchParams();
  const orgIdFromUrl = searchParams.get('organization_id');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Prevent redundant fetches if we already have an organization ID
    if (organizationId) {
      console.log("useOrganizationId: Already have organization ID, skipping fetch:", organizationId);
      return;
    }

    const getOrganizationId = async () => {
      try {
        setIsLoading(true);
        
        // First check if we already have a valid organization ID from props
        if (initialOrgId) {
          console.log("useOrganizationId: Using initial organization ID from props:", initialOrgId);
          setOrganizationId(initialOrgId);
          setIsLoading(false);
          return;
        }
        
        // Then check if organization_id was provided in URL
        if (orgIdFromUrl) {
          console.log("useOrganizationId: Using organization ID from URL:", orgIdFromUrl);
          setOrganizationId(orgIdFromUrl);
          setIsLoading(false);
          return;
        }
        
        // Only fetch from DB if we have no other way to get the org ID
        console.log("useOrganizationId: No organization ID provided, fetching from user membership");
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error("No authenticated user found");
          setIsLoading(false);
          return;
        }
        
        // Check if the user has any organizations
        const { data, error } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .limit(1);
          
        if (error) {
          console.error("Error getting organization ID:", error);
          toast({
            title: "Error",
            description: "Could not determine your organization. Please try again.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
        if (!data || data.length === 0) {
          console.error("No organizations found for user", user.id);
          setIsLoading(false);
          return;
        }
        
        console.log("useOrganizationId: Found organization ID:", data[0].organization_id);
        setOrganizationId(data[0].organization_id);
        setIsLoading(false);
      } catch (error) {
        console.error("Error in getOrganizationId:", error);
        setIsLoading(false);
      }
    };
    
    // Only run if we don't have an organization ID
    if (!organizationId && !initialOrgId && !orgIdFromUrl) {
      getOrganizationId();
    }
  }, [orgIdFromUrl, toast, initialOrgId, organizationId]);

  return {
    organizationId,
    setOrganizationId,
    isLoading
  };
};
