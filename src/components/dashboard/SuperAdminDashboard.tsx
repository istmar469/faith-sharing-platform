import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, TrendingUp, Users, CreditCard, Building, ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle } from 'lucide-react';
import SideNav from './SideNav';
import { supabase } from "@/integrations/supabase/client";
import AdminManagement from '../settings/AdminManagement';
import OrganizationManagement from '../settings/OrganizationManagement';
import UserOrgAssignment from '../settings/UserOrgAssignment';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Loader2 } from 'lucide-react';

type Organization = {
  id: string;
  name: string;
  subdomain: string | null;
  status: string;
  plan: string;
};

const SuperAdminDashboard = () => {
  const { toast } = useToast();
  const [tenants, setTenants] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("organizations");
  
  const fetchOrganizations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*');
      
      if (error) throw error;
      
      const formattedTenants = data.map(org => ({
        id: org.id,
        name: org.name,
        subdomain: org.subdomain,
        status: org.website_enabled ? 'active' : 'inactive',
        plan: 'Standard', // Default plan, can be updated if plan info is available
      }));
      
      setTenants(formattedTenants);
      
      // Set the first organization as selected by default if available
      if (formattedTenants.length > 0 && !selectedOrganizationId) {
        setSelectedOrganizationId(formattedTenants[0].id);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: "Error",
        description: "Failed to load organizations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [toast]);
  
  const showComingSoonToast = () => {
    toast({
      title: "Coming Soon",
      description: "This feature is under development",
    });
  };
  
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
          <TabsContent value="organizations" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Organizations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : tenants.length}</div>
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
                    ) : tenants.length === 0 ? (
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
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Domain</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tenants.map((tenant) => (
                            <TableRow 
                              key={tenant.id} 
                              className={selectedOrganizationId === tenant.id ? "bg-muted/50" : undefined}
                            >
                              <TableCell className="font-medium">{tenant.name}</TableCell>
                              <TableCell>{tenant.subdomain ? `${tenant.subdomain}.church-os.com` : 'No domain set'}</TableCell>
                              <TableCell>
                                {tenant.status === 'active' ? (
                                  <span className="inline-flex items-center text-xs font-medium text-green-600">
                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-xs font-medium text-red-600">
                                    <XCircle className="h-3 w-3 mr-1" /> Inactive
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  tenant.plan === 'Enterprise' ? 'bg-purple-100 text-purple-800' :
                                  tenant.plan === 'Premium' ? 'bg-blue-100 text-blue-800' :
                                  tenant.plan === 'Standard' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {tenant.plan}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button size="sm" variant="ghost" className="h-8 px-2" 
                                  onClick={() => setSelectedOrganizationId(tenant.id)}>
                                  Select
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div>
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
            </div>
          </TabsContent>

          <TabsContent value="user-management" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UserOrgAssignment organizations={tenants} onAssignmentComplete={fetchOrganizations} />
              
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
          
          <TabsContent value="create-organization" className="mt-0">
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
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
