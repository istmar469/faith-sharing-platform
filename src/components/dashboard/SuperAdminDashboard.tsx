
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, TrendingUp, Users, CreditCard, Building, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';
import SideNav from './SideNav';
import { supabase } from "@/integrations/supabase/client";
import AdminManagement from '../settings/AdminManagement';
import OrganizationManagement from '../settings/OrganizationManagement';
import UserOrgAssignment from '../settings/UserOrgAssignment';
import { useNavigate } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import OrganizationsTable, { OrganizationTableItem } from './OrganizationsTable';

type Organization = {
  id: string;
  name: string;
  subdomain: string | null;
  status: string;
  plan: string;
};

const SuperAdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<OrganizationTableItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("organizations");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check authentication and fetch data on mount
  useEffect(() => {
    checkAuthentication();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        navigate('/login');
      } else if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
        fetchOrganizations();
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);
  
  const checkAuthentication = async () => {
    setAuthChecking(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data.user) {
        console.error('Auth error:', error);
        setIsAuthenticated(false);
        toast({
          title: "Authentication Required",
          description: "Please login to access the super admin dashboard",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }
      
      console.log('User authenticated:', data.user);
      setIsAuthenticated(true);
      fetchOrganizations();
    } catch (err) {
      console.error('Error checking authentication:', err);
      setError('Failed to authenticate. Please try again.');
      setIsAuthenticated(false);
      navigate('/login');
    } finally {
      setAuthChecking(false);
    }
  };
  
  const fetchOrganizations = async () => {
    if (isAuthenticated !== true) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching organizations...');
      
      // First check if the user is a super admin
      const { data: superAdminData, error: superAdminError } = await supabase.rpc('check_super_admin');
      
      if (superAdminError) {
        console.error('Error checking super admin status:', superAdminError);
        throw superAdminError;
      }
      
      console.log('Super admin check result:', superAdminData);
      
      if (!superAdminData || !superAdminData.is_super_admin) {
        setError('Access denied: You need super admin privileges to view this dashboard.');
        setOrganizations([]);
        setIsLoading(false);
        return;
      }
      
      // Fetch all organizations for super admin
      const { data, error } = await supabase
        .from('organizations')
        .select('*');
      
      if (error) {
        console.error('Error fetching organizations:', error);
        setError(`Failed to load organizations: ${error.message}`);
        throw error;
      }
      
      console.log('Organizations fetched:', data);
      
      if (!data || data.length === 0) {
        console.log('No organizations found');
        setOrganizations([]);
        setIsLoading(false);
        return;
      }
      
      // Get subscription data for each organization
      const formattedOrgs = data.map(org => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        subdomain: org.subdomain,
        customDomain: org.custom_domain,
        website_enabled: org.website_enabled,
        description: org.description,
        plan: 'Standard', // Default plan - can be updated if you have subscription data
        createdAt: org.created_at
      }));
      
      setOrganizations(formattedOrgs);
      
      // Set the first organization as selected by default if available
      if (formattedOrgs.length > 0 && !selectedOrganizationId) {
        setSelectedOrganizationId(formattedOrgs[0].id);
      }
    } catch (err) {
      console.error('Error in fetchOrganizations:', err);
      toast({
        title: "Error",
        description: "Failed to load organizations",
        variant: "destructive"
      });
      setOrganizations([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const navigateToOrganization = (orgId: string) => {
    navigate(`/tenant-dashboard/${orgId}`);
    toast({
      title: "Navigating to organization",
      description: "Loading organization dashboard...",
    });
  };
  
  const showComingSoonToast = () => {
    toast({
      title: "Coming Soon",
      description: "This feature is under development",
    });
  };
  
  if (authChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-lg font-medium">Verifying authentication...</p>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated === false) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You must be logged in to access the super admin dashboard.
            <div className="mt-4">
              <Button onClick={() => navigate('/login')}>Go to Login</Button>
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
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList>
                <TabsTrigger value="organizations">Organizations</TabsTrigger>
                <TabsTrigger value="user-management">User Management</TabsTrigger>
                <TabsTrigger value="create-organization">Create Organization</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>
        
        <main className="p-6">
          <Tabs value={activeTab} className="mt-0">
            <TabsContent value="organizations">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Organizations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : organizations.length}</div>
                    <p className="text-xs text-green-500 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" /> Organizations managed
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Active Subscriptions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">48</div>
                    <p className="text-xs text-green-500 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" /> 92% active rate
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Monthly Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$14,384</div>
                    <p className="text-xs text-green-500 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" /> +8.2% from last month
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Support Tickets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">7</div>
                    <p className="text-xs text-red-500 flex items-center">
                      <ArrowDownRight className="h-3 w-3 mr-1" /> 3 urgent tickets
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader className="flex justify-between items-center">
                      <div>
                        <CardTitle>Organizations</CardTitle>
                        <CardDescription>Manage church organizations on the platform</CardDescription>
                      </div>
                      {selectedOrganizationId && (
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button>
                              <Users className="h-4 w-4 mr-2" />
                              Manage Members
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-full sm:max-w-[600px] overflow-y-auto">
                            <SheetHeader>
                              <SheetTitle>Manage Organization</SheetTitle>
                              <SheetDescription>
                                Add or remove members and set their roles.
                              </SheetDescription>
                            </SheetHeader>
                            <div className="py-6">
                              <AdminManagement organizationId={selectedOrganizationId} />
                            </div>
                          </SheetContent>
                        </Sheet>
                      )}
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="flex items-center justify-center py-10">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : error ? (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      ) : organizations.length === 0 ? (
                        <div className="py-10 text-center">
                          <p className="text-muted-foreground">No organizations found</p>
                          <Button 
                            className="mt-4"
                            onClick={() => setActiveTab("create-organization")}
                          >
                            <Building className="h-4 w-4 mr-2" />
                            Create Your First Organization
                          </Button>
                        </div>
                      ) : (
                        <OrganizationsTable
                          organizations={organizations}
                          isLoading={isLoading}
                          onSelectOrganization={setSelectedOrganizationId}
                          selectedOrganizationId={selectedOrganizationId}
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Subscription Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Enterprise</span>
                          <span className="text-sm text-gray-500">12 churches</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: '23%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Premium</span>
                          <span className="text-sm text-gray-500">21 churches</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: '40%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Standard</span>
                          <span className="text-sm text-gray-500">15 churches</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: '29%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Basic</span>
                          <span className="text-sm text-gray-500">4 churches</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-500" style={{ width: '8%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start" onClick={showComingSoonToast}>
                      <Users className="h-4 w-4 mr-2" /> Add New Tenant
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={showComingSoonToast}>
                      <Building className="h-4 w-4 mr-2" /> Module Management
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={showComingSoonToast}>
                      <BarChart3 className="h-4 w-4 mr-2" /> View Reports
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={showComingSoonToast}>
                      <CreditCard className="h-4 w-4 mr-2" /> Billing Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="user-management">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UserOrgAssignment 
                  organizations={organizations} 
                  onAssignmentComplete={fetchOrganizations} 
                />
                
                <Card>
                  <CardHeader>
                    <CardTitle>User Management Tips</CardTitle>
                    <CardDescription>
                      How to effectively manage users in organizations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">
                      <strong>User Roles:</strong>
                      <ul className="ml-4 mt-2 space-y-2 list-disc">
                        <li><strong>Admin:</strong> Can manage organization settings and users</li>
                        <li><strong>Editor:</strong> Can edit content but not organization settings</li>
                        <li><strong>Member:</strong> Can view content with limited editing rights</li>
                      </ul>
                    </p>
                    <p className="text-sm">
                      <strong>When assigning users:</strong>
                      <ul className="ml-4 mt-2 space-y-2 list-disc">
                        <li>Make sure the user has created an account first</li>
                        <li>You can update a user's role by reassigning them</li>
                        <li>Users can belong to multiple organizations</li>
                      </ul>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="create-organization">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <OrganizationManagement onOrganizationCreated={() => {
                  fetchOrganizations();
                  setActiveTab("organizations");
                  toast({
                    title: "Success",
                    description: "Organization created and added to your dashboard",
                  });
                }} />
                
                <Card>
                  <CardHeader>
                    <CardTitle>Organization Management</CardTitle>
                    <CardDescription>
                      Tips for setting up organizations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">
                      <strong>Organization Name:</strong> Choose a clear, recognizable name for the organization.
                    </p>
                    <p className="text-sm">
                      <strong>Slug:</strong> This creates a unique URL path for the organization. Use lowercase letters, numbers, and hyphens only.
                    </p>
                    <p className="text-sm">
                      <strong>Subdomain:</strong> If provided, creates a custom subdomain for accessing the organization's pages.
                    </p>
                    <p className="text-sm">
                      <strong>After creation:</strong>
                      <ul className="ml-4 mt-2 space-y-2 list-disc">
                        <li>Assign users to the organization</li>
                        <li>Configure organization settings in the organization dashboard</li>
                        <li>Add admins to help manage the organization</li>
                      </ul>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
