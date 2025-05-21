
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { BarChart3, TrendingUp, Users, CreditCard, Building, ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle } from 'lucide-react';
import SideNav from './SideNav';

const SuperAdminDashboard = () => {
  const { toast } = useToast();
  
  const showComingSoonToast = () => {
    toast({
      title: "Coming Soon",
      description: "This feature is under development",
    });
  };
  
  const tenants = [
    { id: 1, name: "First Baptist Church", domain: "firstbaptist.church-os.com", status: "active", plan: "Premium" },
    { id: 2, name: "Grace Community Church", domain: "gracecommunity.church-os.com", status: "active", plan: "Standard" },
    { id: 3, name: "St. Mary's Cathedral", domain: "stmarys.church-os.com", status: "active", plan: "Enterprise" },
    { id: 4, name: "Hillside Chapel", domain: "hillside.church-os.com", status: "inactive", plan: "Standard" },
    { id: 5, name: "New Life Church", domain: "newlife.church-os.com", status: "active", plan: "Basic" },
  ];
  
  return (
    <div className="flex h-screen bg-gray-100">
      <SideNav isSuperAdmin={true} />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
          </div>
        </header>
        
        <main className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Tenants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">52</div>
                <p className="text-xs text-green-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> +4 this month
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
                <CardHeader>
                  <CardTitle>Recent Tenants</CardTitle>
                  <CardDescription>Latest church tenants on the platform</CardDescription>
                </CardHeader>
                <CardContent>
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
                        <TableRow key={tenant.id}>
                          <TableCell className="font-medium">{tenant.name}</TableCell>
                          <TableCell>{tenant.domain}</TableCell>
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
                            <Button size="sm" variant="ghost" className="h-8 px-2" onClick={showComingSoonToast}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={showComingSoonToast}>
                    View All Tenants
                  </Button>
                </CardFooter>
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
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
