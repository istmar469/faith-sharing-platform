import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useOrganizationId = () => {
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const orgIdFromUrl = searchParams.get('organization_id');
  const { toast } = useToast();

  useEffect(() => {
    const getOrganizationId = async () => {
      // First check if organization_id was provided in URL
      if (orgIdFromUrl) {
        console.log("Using organization ID from URL:", orgIdFromUrl);
        setOrganizationId(orgIdFromUrl);
        return;
      }
      
      // Otherwise fetch from user's membership
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .single();
          
        if (data && !error) {
          console.log("Found organization ID:", data.organization_id);
          setOrganizationId(data.organization_id);
        } else {
          console.error("Error getting organization ID:", error);
          toast({
            title: "Error",
            description: "Could not determine your organization. Please try again or contact support.",
            variant: "destructive"
          });
        }
      } else {
        console.error("No authenticated user found");
        toast({
          title: "Authentication Error",
          description: "You need to be logged in to use the page builder.",
          variant: "destructive"
        });
      }
    };
    
    getOrganizationId();
  }, [orgIdFromUrl, toast]);

  return {
    organizationId,
    setOrganizationId
  };
};
