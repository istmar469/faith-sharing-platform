import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SideNav from './SideNav';
import OrganizationHeader from './OrganizationHeader';
import OrganizationOverview from './OrganizationOverview';
import OrganizationMembers from './OrganizationMembers';
import OrganizationSettings from './OrganizationSettings';
import OrganizationLoading from './OrganizationLoading';
import OrganizationError from './OrganizationError';
import { OrganizationData } from './types';
import { isUuid } from '@/utils/domainUtils';
import LoginDialog from '../auth/LoginDialog';

const OrganizationDashboard = () => {
  // Extract the organizationId from URL parameters
  const { organizationId } = useParams<{ organizationId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [availableOrgs, setAvailableOrgs] = useState<Array<{id: string, name: string}> | null>(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data.user) {
        console.log("User not authenticated, showing login dialog");
        setLoginDialogOpen(true);
        setIsLoading(false);
        return;
      }
      
      // After confirming authentication, fetch the user's available organizations
      const { data: orgsData } = await supabase
        .from('organizations')
        .select('id, name')
        .order('name');
        
      if (orgsData && orgsData.length > 0) {
        setAvailableOrgs(orgsData);
      }
      
      fetchOrganizationDetails();
    };
    
    checkAuth();
  }, [organizationId]);
  
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
  
  const showComingSoonToast = () => {
    toast({
      title: "Coming Soon",
      description: "This feature is under development",
    });
  };
  
  const handleRetry = () => {
    fetchOrganizationDetails();
  };
  
  if (isLoading) {
    return <OrganizationLoading />;
  }
  
  if (loginDialogOpen) {
    return (
      <>
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="text-center max-w-md p-6">
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="mb-4 text-gray-600">Please log in to view this organization.</p>
          </div>
        </div>
        <LoginDialog 
          isOpen={loginDialogOpen} 
          setIsOpen={(open) => {
            setLoginDialogOpen(open);
            if (!open) {
              // If the dialog is closed, check auth again
              window.location.reload();
            }
          }} 
        />
      </>
    );
  }
  
  if (error || !organization) {
    return <OrganizationError 
      error={error} 
      onRetry={handleRetry} 
      availableOrgs={availableOrgs}
    />;
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      <SideNav isSuperAdmin={true} />
      
      <div className="flex-1 overflow-auto">
        <OrganizationHeader 
          organization={organization}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleWebsiteToggle={handleWebsiteToggle}
          showComingSoonToast={showComingSoonToast}
        />
        
        <main className="p-6">
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="overview">
              <OrganizationOverview 
                organization={organization}
                handleWebsiteToggle={handleWebsiteToggle}
              />
            </TabsContent>
            
            <TabsContent value="members">
              <OrganizationMembers showComingSoonToast={showComingSoonToast} />
            </TabsContent>
            
            <TabsContent value="settings">
              <OrganizationSettings showComingSoonToast={showComingSoonToast} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default OrganizationDashboard;
