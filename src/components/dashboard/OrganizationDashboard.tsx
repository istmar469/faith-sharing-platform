
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Building, Users, Settings, Globe, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import SideNav from './SideNav';
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type OrganizationData = {
  id: string;
  name: string;
  subdomain: string | null;
  description: string | null;
  website_enabled: boolean;
  slug: string;
  custom_domain: string | null;
};

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
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-lg font-medium">Loading organization details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !organization) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "Organization not found"}
            <div className="mt-4">
              <Button onClick={() => navigate('/super-admin')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      <SideNav isSuperAdmin={true} />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/super-admin')}
                    className="flex items-center text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
                </div>
                <p className="text-sm text-muted-foreground">
                  {organization.subdomain ? `${organization.subdomain}.church-os.com` : 'No domain set'}
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant={organization.website_enabled ? "default" : "outline"}
                  onClick={handleWebsiteToggle}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {organization.website_enabled ? "Website Enabled" : "Enable Website"}
                </Button>
                <Button variant="outline" onClick={showComingSoonToast}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>
        
        <main className="p-6">
          <Tabs value={activeTab} className="mt-0">
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Organization Details</CardTitle>
                    <CardDescription>Basic information about this organization</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Name</p>
                      <p className="text-sm text-muted-foreground">{organization.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Slug</p>
                      <p className="text-sm text-muted-foreground">{organization.slug}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Subdomain</p>
                      <p className="text-sm text-muted-foreground">
                        {organization.subdomain ? `${organization.subdomain}.church-os.com` : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Custom Domain</p>
                      <p className="text-sm text-muted-foreground">
                        {organization.custom_domain || 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Description</p>
                      <p className="text-sm text-muted-foreground">
                        {organization.description || 'No description provided'}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={showComingSoonToast}>
                      Edit Details
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks for this organization</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start" onClick={() => navigate('/page-builder')}>
                      <Globe className="h-4 w-4 mr-2" /> Edit Website
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={showComingSoonToast}>
                      <Users className="h-4 w-4 mr-2" /> Manage Members
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={showComingSoonToast}>
                      <Building className="h-4 w-4 mr-2" /> Organization Settings
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={showComingSoonToast}>
                      <BarChart3 className="h-4 w-4 mr-2" /> View Analytics
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Website Status</CardTitle>
                    <CardDescription>Current website configuration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Status</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          organization.website_enabled 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {organization.website_enabled ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Domain</p>
                        <p className="text-sm text-muted-foreground">
                          {organization.subdomain 
                            ? `${organization.subdomain}.church-os.com` 
                            : 'No domain configured'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Custom Domain</p>
                        <p className="text-sm text-muted-foreground">
                          {organization.custom_domain || 'None'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant={organization.website_enabled ? "outline" : "default"} 
                      className="w-full"
                      onClick={handleWebsiteToggle}
                    >
                      {organization.website_enabled ? 'Disable Website' : 'Enable Website'}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <CardTitle>Organization Members</CardTitle>
                  <CardDescription>Manage members of this organization</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-8 text-muted-foreground">
                    Member management functionality coming soon
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={showComingSoonToast}>
                    <Users className="h-4 w-4 mr-2" /> Add Members
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Organization Settings</CardTitle>
                  <CardDescription>Configure organization preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-8 text-muted-foreground">
                    Organization settings functionality coming soon
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={showComingSoonToast}>
                    <Settings className="h-4 w-4 mr-2" /> Edit Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default OrganizationDashboard;
