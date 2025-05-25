import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { OrganizationData } from '../types';
import { isUuid } from '@/utils/domain';

export const useOrganizationData = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const { toast } = useToast();
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableOrgs, setAvailableOrgs] = useState<Array<{id: string, name: string}> | null>(null);
  
  const fetchOrganizationDetails = async () => {
    // Validate organizationId is provided
    if (!organizationId || organizationId === ':organizationId') {
      setError("Missing organization ID");
      setIsLoading(false);
      return;
    }
    
    // Additional validation that organizationId looks like a UUID
    if (!isUuid(organizationId)) {
      setError(`Invalid organization ID format: ${organizationId}`);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Log the actual ID we're using for debugging
      console.log("Fetching organization with ID:", organizationId);
      
      // First check if the organization exists at all
      const { count, error: countError } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })
        .eq('id', organizationId);
      
      if (countError) {
        console.error('Error checking if organization exists:', countError);
        setError(`Database error: ${countError.message}`);
        setIsLoading(false);
        return;
      }
      
      if (!count || count === 0) {
        console.error('Organization not found with ID:', organizationId);
        setError(`No organization exists with ID: ${organizationId}`);
        toast({
          title: "Organization Not Found",
          description: `The organization with ID ${organizationId} does not exist in the database`,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Now fetch the organization details since we know it exists
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();
      
      if (error) {
        console.error('Error fetching organization:', error);
        setError(`Failed to load organization: ${error.message}`);
        setIsLoading(false);
        return;
      }
      
      setOrganization(data as OrganizationData);
    } catch (err) {
      console.error('Error in fetchOrganizationDetails:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebsiteToggle = async () => {
    if (!organization) return;
    
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ website_enabled: !organization.website_enabled })
        .eq('id', organization.id);
      
      if (error) {
        toast({
          title: "Error",
          description: `Failed to update website status: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      setOrganization({
        ...organization,
        website_enabled: !organization.website_enabled
      });
      
      toast({
        title: "Success",
        description: `Website is now ${!organization.website_enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };
  
  const fetchAvailableOrgs = async () => {
    const { data: orgsData } = await supabase
      .from('organizations')
      .select('id, name')
      .order('name');
      
    if (orgsData && orgsData.length > 0) {
      setAvailableOrgs(orgsData);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data.user) {
        console.log("User not authenticated");
        setIsLoading(false);
        return false;
      }
      
      await fetchAvailableOrgs();
      return true;
    };
    
    checkAuth().then(isAuthenticated => {
      if (isAuthenticated) {
        fetchOrganizationDetails();
      }
    });
  }, [organizationId]);

  return {
    organization,
    isLoading,
    error,
    availableOrgs,
    handleWebsiteToggle,
    fetchOrganizationDetails
  };
};
