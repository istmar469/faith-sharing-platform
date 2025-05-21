
import React from 'react';
import { Link } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Globe, FileText, Settings, CreditCard, Users, Video, Calendar, ArrowRight } from 'lucide-react';
import SideNav from './SideNav';

const TenantDashboard = () => {
  const { toast } = useToast();
  
  const showComingSoonToast = () => {
    toast({
      title: "Coming Soon",
      description: "This feature is under development",
    });
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      <SideNav />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Tenant Dashboard</h1>
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
