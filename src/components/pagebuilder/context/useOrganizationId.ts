
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useOrganizationId = (initialOrgId: string | null = null) => {
  const [organizationId, setOrganizationId] = useState<string | null>(initialOrgId);
  const [searchParams] = useSearchParams();
  const orgIdFromUrl = searchParams.get('organization_id');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const getOrganizationId = async () => {
      try {
        setIsLoading(true);
        
        // Set a timeout to prevent infinite loading state
        const timeout = setTimeout(() => {
          console.error("Organization ID resolution timed out");
          setIsLoading(false);
          toast({
            title: "Loading Error",
            description: "Could not determine organization context in time. Please try again.",
            variant: "destructive"
          });
        }, 10000); // 10 second timeout
        
        setLoadingTimeout(timeout);
        
        // First check if we already have a valid organization ID from props
        // This should be the most common case and prevent unnecessary DB calls
        if (initialOrgId) {
          console.log("useOrganizationId: Using initial organization ID from props:", initialOrgId);
          setOrganizationId(initialOrgId);
          setIsLoading(false);
          clearTimeout(timeout);
          return;
        }
        
        // Then check if organization_id was provided in URL
        if (orgIdFromUrl) {
          console.log("useOrganizationId: Using organization ID from URL:", orgIdFromUrl);
          setOrganizationId(orgIdFromUrl);
          setIsLoading(false);
          clearTimeout(timeout);
          return;
        }
        
        // Only fetch from DB if we have no other way to get the org ID
        console.log("useOrganizationId: No organization ID provided, fetching from user membership");
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error("No authenticated user found");
          toast({
            title: "Authentication Error",
            description: "You need to be logged in to use the page builder. Please log in first.",
            variant: "destructive"
          });
          setIsLoading(false);
          clearTimeout(timeout);
          return;
        }
        
        // Check if the user has any organizations
        const { data, error } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id);
          
        if (error) {
          console.error("Error getting organization ID:", error);
          toast({
            title: "Error",
            description: "Could not determine your organization. Please try again or contact support.",
            variant: "destructive"
          });
          setIsLoading(false);
          clearTimeout(timeout);
          return;
        }
        
        // If no organizations found, show a more helpful message
        if (!data || data.length === 0) {
          console.error("No organizations found for user", user.id);
          toast({
            title: "No Organization Found",
            description: "You don't have any organizations assigned to your account. Please create an organization or ask an administrator to add you to one.",
            variant: "destructive"
          });
          setIsLoading(false);
          clearTimeout(timeout);
          return;
        }
        
        // Use the first organization found
        console.log("useOrganizationId: Found organization ID:", data[0].organization_id);
        setOrganizationId(data[0].organization_id);
        setIsLoading(false);
        clearTimeout(timeout);
      } catch (error) {
        console.error("Error in getOrganizationId:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again or contact support.",
          variant: "destructive"
        });
        setIsLoading(false);
        if (loadingTimeout) clearTimeout(loadingTimeout);
      }
    };
    
    getOrganizationId();
    
    return () => {
      // Clean up timeout on unmount
      if (loadingTimeout) clearTimeout(loadingTimeout);
    };
  }, [orgIdFromUrl, toast, initialOrgId]);

  return {
    organizationId,
    setOrganizationId,
    isLoading
  };
};
