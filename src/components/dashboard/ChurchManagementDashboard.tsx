import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Calendar, DollarSign, MessageSquare, Settings, Home, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTenantContext } from '@/components/context/TenantContext';
import DashboardSidebar from './DashboardSidebar';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import ChurchComponentsManager from './ChurchComponentsManager';

interface Organization {
  id: string;
  name: string;
  subdomain?: string;
  website_enabled?: boolean;
}

interface DashboardStats {
  totalMembers: number;
  upcomingEvents: number;
  monthlyDonations: number;
  recentActivity: number;
}

const ChurchManagementDashboard: React.FC = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const { isSubdomainAccess, organizationId: contextOrgId } = useTenantContext();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    upcomingEvents: 0,
    monthlyDonations: 0,
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Use context org ID if available (for subdomain access), otherwise use URL param
  const currentOrgId = contextOrgId || organizationId;

  useEffect(() => {
    checkAuthAndFetchData();
  }, [currentOrgId]);

  const checkAuthAndFetchData = async () => {
    try {
      // Check authentication
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);

      if (!currentOrgId) {
        setLoading(false);
        return;
      }

      // Fetch organization data
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', currentOrgId)
        .single();

      if (orgError) {
        console.error('Error fetching organization:', orgError);
        toast({
          title: "Error",
          description: "Failed to load organization data",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      setOrganization(orgData);

      // Fetch dashboard statistics
      await fetchDashboardStats();

    } catch (error) {
      console.error('Error in checkAuthAndFetchData:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    if (!currentOrgId) return;

    try {
      // Get total events count
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrgId)
        .gte('date', new Date().toISOString().split('T')[0]);

      // Get total donations for current month
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const { data: donationsData } = await supabase
        .from('donations')
        .select('amount')
        .eq('organization_id', currentOrgId)
        .gte('donation_date', `${currentMonth}-01`)
        .lt('donation_date', `${currentMonth}-32`);

      const monthlyTotal = donationsData?.reduce((sum, donation) => sum + Number(donation.amount), 0) || 0;

      setStats({
        totalMembers: 0, // We'll implement member management next
        upcomingEvents: eventsCount || 0,
        monthlyDonations: monthlyTotal,
        recentActivity: 5 // Placeholder
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const handleCreateEvent = () => {
    toast({
      title: "Coming Soon",
      description: "Event creation will be available soon",
    });
  };

  const handleViewMembers = () => {
    toast({
      title: "Coming Soon",
      description: "Member management will be available soon",
    });
  };

  const handleViewDonations = () => {
    toast({
      title: "Coming Soon",
      description: "Donation tracking will be available soon",
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-lg font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!currentOrgId || !organization) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center max-w-md p-6">
          <h2 className="text-2xl font-bold mb-2">Organization Not Found</h2>
          <p className="mb-4 text-gray-600">The requested organization could not be found or you don't have access to it.</p>
          <Button onClick={() => window.location.href = '/'}>
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-white w-full">
        <DashboardSidebar isSuperAdmin={false} organizationId={currentOrgId} />
        
        <SidebarInset className="flex-1 overflow-auto">
          <header className="bg-white shadow-sm border-b">
            <div className="px-6 py-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="lg:hidden" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {organization.name} Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Church Management System
                    </p>
                  </div>
                </div>
                
                {organization.website_enabled && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Website Active
                  </Badge>
                )}
              </div>
            </div>
          </header>
          
          <main className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="finances">Finances</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalMembers}</div>
                      <p className="text-xs text-muted-foreground">Active church members</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
                      <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Monthly Donations</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${stats.monthlyDonations}</div>
                      <p className="text-xs text-muted-foreground">Current month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.recentActivity}</div>
                      <p className="text-xs text-muted-foreground">This week</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks and shortcuts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Button onClick={handleCreateEvent} className="h-auto p-4 flex flex-col gap-2">
                        <Plus className="h-6 w-6" />
                        <span>Create Event</span>
                      </Button>
                      
                      <Button onClick={handleViewMembers} variant="outline" className="h-auto p-4 flex flex-col gap-2">
                        <Users className="h-6 w-6" />
                        <span>Manage Members</span>
                      </Button>
                      
                      <Button onClick={handleViewDonations} variant="outline" className="h-auto p-4 flex flex-col gap-2">
                        <DollarSign className="h-6 w-6" />
                        <span>Record Donation</span>
                      </Button>
                      
                      <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                        <Settings className="h-6 w-6" />
                        <span>Church Settings</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest updates and actions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Dashboard accessed</p>
                          <p className="text-xs text-muted-foreground">Just now</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Organization data loaded</p>
                          <p className="text-xs text-muted-foreground">1 minute ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="members">
                <Card>
                  <CardHeader>
                    <CardTitle>Member Management</CardTitle>
                    <CardDescription>Manage your church members and their information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Member Management Coming Soon</h3>
                      <p className="text-muted-foreground mb-4">
                        Add, edit, and manage your church members with roles and contact information.
                      </p>
                      <Button onClick={handleViewMembers}>
                        <Plus className="mr-2 h-4 w-4" />
                        Get Started
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="events">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Management</CardTitle>
                    <CardDescription>Plan and manage church events and services</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Event Management</h3>
                      <p className="text-muted-foreground mb-4">
                        Create and manage church events, services, and special occasions.
                      </p>
                      <Button onClick={handleCreateEvent}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Event
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="finances">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Management</CardTitle>
                    <CardDescription>Track donations and manage church finances</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Financial Tracking</h3>
                      <p className="text-muted-foreground mb-4">
                        Record donations, track funds, and generate financial reports.
                      </p>
                      <Button onClick={handleViewDonations}>
                        <Plus className="mr-2 h-4 w-4" />
                        Record Donation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Church Settings</CardTitle>
                    <CardDescription>Configure your church information and preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Organization Details</h4>
                        <div className="grid gap-4">
                          <div>
                            <label className="text-sm text-muted-foreground">Church Name</label>
                            <p className="font-medium">{organization.name}</p>
                          </div>
                          {organization.subdomain && (
                            <div>
                              <label className="text-sm text-muted-foreground">Subdomain</label>
                              <p className="font-medium">{organization.subdomain}.church-os.com</p>
                            </div>
                          )}
                          <div>
                            <label className="text-sm text-muted-foreground">Website Status</label>
                            <p className="font-medium">
                              {organization.website_enabled ? 'Active' : 'Disabled'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <Button variant="outline">
                          <Settings className="mr-2 h-4 w-4" />
                          Advanced Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Church Components Manager */}
                <ChurchComponentsManager />
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ChurchManagementDashboard;
