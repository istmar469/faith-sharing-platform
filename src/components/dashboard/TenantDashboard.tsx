import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Globe, FileText, Settings, CreditCard, Users, Video, Calendar, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import SideNav from './SideNav';
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import LoginDialog from '../auth/LoginDialog';

interface Organization {
  id: string;
  name: string;
  role: string;
  subdomain?: string;
  custom_domain?: string;
}

const TenantDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  
  useEffect(() => {
    checkAuthAndFetchOrgs();
  }, []);

  const checkAuthAndFetchOrgs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        console.log("User not authenticated, showing login dialog");
        setLoginDialogOpen(true);
        setIsLoading(false);
        return;
      }
      
      // Fetch user's organizations
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select(`
          id,
          name,
          subdomain,
          custom_domain,
          organization_members!inner(role)
        `)
        .eq('organization_members.user_id', userData.user.id);
      
      if (orgsError) {
        console.error("Error fetching organizations:", orgsError);
        setError("Failed to load your organizations");
        setIsLoading(false);
        return;
      }
      
      // Check if user is super admin
      const { data: superAdminData, error: superAdminError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', userData.user.id)
        .eq('role', 'super_admin')
        .maybeSingle();
      
      setIsSuperAdmin(!!superAdminData);
      
      // Process organizations data
      const organizations = orgsData?.map(org => ({
        id: org.id,
        name: org.name,
        subdomain: org.subdomain,
        custom_domain: org.custom_domain,
        role: org.organization_members[0]?.role || 'member'
      })) || [];
      
      setUserOrganizations(organizations);
      
      // Handle redirection based on number of organizations
      if (organizations.length === 0) {
        toast({
          title: "No organizations found",
          description: "You don't have access to any organizations",
          variant: "destructive"
        });
      } else if (organizations.length === 1 && !isSuperAdmin) {
        // Redirect to the only organization dashboard
        navigate(`/tenant-dashboard/${organizations[0].id}`);
      }
      // Otherwise, stay on this page to let the user select an organization
      
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
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
          <p className="text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (loginDialogOpen) {
    return (
      <>
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              Please log in to access the dashboard
            </AlertDescription>
          </Alert>
        </div>
        <LoginDialog isOpen={loginDialogOpen} setIsOpen={(open) => {
          setLoginDialogOpen(open);
          if (!open) {
            // If the dialog is closed, refresh the page to check auth again
            window.location.reload();
          }
        }} />
      </>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-4">
              <Button onClick={() => setLoginDialogOpen(true)}>
                Log In
              </Button>
            </div>
          </AlertDescription>
        </Alert>
        <LoginDialog isOpen={loginDialogOpen} setIsOpen={setLoginDialogOpen} />
      </div>
    );
  }
  
  // If super admin, show a page to select which organization to manage
  if (isSuperAdmin && userOrganizations.length > 0) {
    return (
      <div className="flex h-screen bg-gray-100">
        <SideNav isSuperAdmin={isSuperAdmin} />
        
        <div className="flex-1 overflow-auto">
          <header className="bg-white shadow-sm">
            <div className="px-6 py-4">
              <h1 className="text-2xl font-bold text-gray-900">Select Organization</h1>
              <p className="text-sm text-muted-foreground">
                You have access to multiple organizations. Select one to manage.
              </p>
            </div>
          </header>
          
          <main className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userOrganizations.map((org) => (
                <Card key={org.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>{org.name}</CardTitle>
                    <CardDescription>
                      {org.subdomain ? `${org.subdomain}.church-os.com` : 'No domain set'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {org.role}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => navigate(`/tenant-dashboard/${org.id}`)}
                    >
                      Manage <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/super-admin')}
                className="mt-4"
              >
                Go to Super Admin Dashboard
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  // Default tenant dashboard view for single organization users
  return (
    <div className="flex h-screen bg-gray-100">
      <SideNav isSuperAdmin={isSuperAdmin} />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Tenant Dashboard</h1>
            {userOrganizations.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {userOrganizations[0].name}
              </p>
            )}
          </div>
        </header>
        
        <main className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Weekly Donations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$1,254.00</div>
                <p className="text-xs text-green-500 flex items-center">
                  +12.5% from last week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Website Visitors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,423</div>
                <p className="text-xs text-green-500 flex items-center">
                  +5.2% from last week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-gray-500 flex items-center">
                  Next: Sunday Service (2 days)
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline"
                className="flex flex-col items-center justify-center h-24 p-2 bg-white hover:bg-gray-50"
                onClick={showComingSoonToast}
              >
                <FileText className="h-8 w-8 mb-2 text-primary" />
                <span>Create Page</span>
              </Button>
              
              <Button 
                variant="outline"
                className="flex flex-col items-center justify-center h-24 p-2 bg-white hover:bg-gray-50"
                onClick={showComingSoonToast}
              >
                <Video className="h-8 w-8 mb-2 text-primary" />
                <span>Schedule Stream</span>
              </Button>
              
              <Button 
                variant="outline"
                className="flex flex-col items-center justify-center h-24 p-2 bg-white hover:bg-gray-50"
                onClick={showComingSoonToast}
              >
                <Calendar className="h-8 w-8 mb-2 text-primary" />
                <span>Add Event</span>
              </Button>
              
              <Button 
                variant="outline"
                className="flex flex-col items-center justify-center h-24 p-2 bg-white hover:bg-gray-50"
                onClick={showComingSoonToast}
              >
                <CreditCard className="h-8 w-8 mb-2 text-primary" />
                <span>Donation Form</span>
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your site's recent activities and changes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center text-white mr-3">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Home page updated</p>
                        <p className="text-xs text-gray-500">Yesterday at 4:30 PM</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center text-white mr-3">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Donation received: $50.00</p>
                        <p className="text-xs text-gray-500">2 days ago at 10:15 AM</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center text-white mr-3">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">New subscriber: john.doe@example.com</p>
                        <p className="text-xs text-gray-500">3 days ago at 3:45 PM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={showComingSoonToast}>
                    View All Activity
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Your Subscription</CardTitle>
                  <CardDescription>Current plan and usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-3 bg-primary/10 rounded-md border border-primary/20">
                    <h3 className="font-medium text-primary">Standard Plan</h3>
                    <p className="text-sm text-gray-500">Renews on Jun 1, 2025</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Storage</span>
                      <span className="font-medium">45% used</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '45%' }}></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Bandwidth</span>
                      <span className="font-medium">32% used</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '32%' }}></div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={showComingSoonToast}>
                    Manage Subscription
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TenantDashboard;
