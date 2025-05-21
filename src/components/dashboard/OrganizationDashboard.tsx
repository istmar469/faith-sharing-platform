
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

const OrganizationDashboard = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data.user) {
        toast({
          title: "Authentication Required",
          description: "Please login to view this organization",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }
      
      fetchOrganizationDetails();
    };
    
    checkAuth();
  }, [organizationId, navigate]);
  
  const fetchOrganizationDetails = async () => {
    if (!organizationId) {
      setError("No organization ID provided");
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Log the actual ID we're using for debugging
      console.log("Fetching organization with ID:", organizationId);
      
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
      
      if (!data) {
        setError('Organization not found');
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
  
  if (error || !organization) {
    return <OrganizationError error={error} onRetry={handleRetry} />;
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
