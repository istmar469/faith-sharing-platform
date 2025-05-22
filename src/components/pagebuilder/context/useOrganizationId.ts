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

  useEffect(() => {
    const getOrganizationId = async () => {
      try {
        setIsLoading(true);
        
        // First check if organization_id was provided in URL
        if (orgIdFromUrl) {
          console.log("Using organization ID from URL:", orgIdFromUrl);
          setOrganizationId(orgIdFromUrl);
          setIsLoading(false);
          return;
        }
        
        // Check if we already have an organization ID from props
        if (initialOrgId) {
          console.log("Using initial organization ID from props:", initialOrgId);
          setOrganizationId(initialOrgId);
          setIsLoading(false);
          return;
        }
        
        // Otherwise fetch from user's membership
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error("No authenticated user found");
          toast({
            title: "Authentication Error",
            description: "You need to be logged in to use the page builder. Please log in first.",
            variant: "destructive"
          });
          setIsLoading(false);
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
          return;
        }
        
        // Use the first organization found
        console.log("Found organization ID:", data[0].organization_id);
        setOrganizationId(data[0].organization_id);
        setIsLoading(false);
      } catch (error) {
        console.error("Error in getOrganizationId:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again or contact support.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    
    getOrganizationId();
  }, [orgIdFromUrl, toast, initialOrgId]);

  return {
    organizationId,
    setOrganizationId,
    isLoading
  };
};
