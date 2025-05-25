import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, MapPin, Phone, Mail, Globe, Image } from 'lucide-react';
import DashboardSidebar from '../dashboard/DashboardSidebar';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const TenantManagementSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  
  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your tenant settings have been updated",
    });
  };
  
  console.log("TenantManagementSettings: Rendering with DashboardSidebar");
  
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-white w-full">
        <DashboardSidebar 
          isSuperAdmin={false} 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <SidebarInset className="flex-1 overflow-auto">
          <header className="bg-white shadow-sm border-b">
            <div className="px-6 py-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="lg:hidden" />
                <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
              </div>
            </div>
          </header>
          
          <main className="p-6">
            <Tabs defaultValue="general" className="max-w-4xl mx-auto">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="contact">Contact Info</TabsTrigger>
                <TabsTrigger value="branding">Branding</TabsTrigger>
                <TabsTrigger value="modules">Modules</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>General Information</CardTitle>
                    <CardDescription>Basic information about your church</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="church-name">Church Name</Label>
                      <Input id="church-name" defaultValue="First Baptist Church" className="mt-1" />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        className="mt-1" 
                        rows={4}
                        defaultValue="A welcoming community of faith serving our city since 1952."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Brief description used on your website and promotional materials
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="denomination">Denomination</Label>
                      <Select defaultValue="baptist">
                        <SelectTrigger id="denomination" className="mt-1">
                          <SelectValue placeholder="Select denomination" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baptist">Baptist</SelectItem>
                          <SelectItem value="catholic">Catholic</SelectItem>
                          <SelectItem value="episcopal">Episcopal</SelectItem>
                          <SelectItem value="lutheran">Lutheran</SelectItem>
                          <SelectItem value="methodist">Methodist</SelectItem>
                          <SelectItem value="nondenominational">Non-Denominational</SelectItem>
                          <SelectItem value="presbyterian">Presbyterian</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="size">Church Size</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger id="size" className="mt-1">
                          <SelectValue placeholder="Select church size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small (under 100)</SelectItem>
                          <SelectItem value="medium">Medium (100-500)</SelectItem>
                          <SelectItem value="large">Large (500-2000)</SelectItem>
                          <SelectItem value="mega">Mega (2000+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="public-listing">Public Directory Listing</Label>
                        <p className="text-xs text-gray-500">
                          Allow your church to be found in our public directory
                        </p>
                      </div>
                      <Switch id="public-listing" defaultChecked />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSave}>Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="contact">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>How people can reach your church</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="email">Church Email</Label>
                      <div className="flex mt-1">
                        <Mail className="h-5 w-5 text-gray-400 mr-2 mt-2" />
                        <Input id="email" defaultValue="info@firstbaptist.org" className="flex-1" />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex mt-1">
                        <Phone className="h-5 w-5 text-gray-400 mr-2 mt-2" />
                        <Input id="phone" defaultValue="(555) 123-4567" className="flex-1" />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <div className="flex mt-1">
                        <Globe className="h-5 w-5 text-gray-400 mr-2 mt-2" />
                        <Input id="website" defaultValue="https://firstbaptist.org" className="flex-1" />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Physical Address</Label>
                      <div className="flex mt-1">
                        <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-2" />
                        <Textarea id="address" defaultValue="123 Main Street&#13;&#10;Anytown, CA 12345" className="flex-1" />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Service Times</Label>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center gap-2">
                          <Input placeholder="Sunday" defaultValue="Sunday" className="w-1/3" />
                          <Input placeholder="9:00 AM" defaultValue="9:00 AM" className="w-1/3" />
                          <Input placeholder="Traditional" defaultValue="Traditional" className="w-1/3" />
                          <Button variant="ghost" size="sm">X</Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input placeholder="Sunday" defaultValue="Sunday" className="w-1/3" />
                          <Input placeholder="11:00 AM" defaultValue="11:00 AM" className="w-1/3" />
                          <Input placeholder="Contemporary" defaultValue="Contemporary" className="w-1/3" />
                          <Button variant="ghost" size="sm">X</Button>
                        </div>
                        <Button variant="outline" className="w-full mt-2">+ Add Service Time</Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSave}>Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="branding">
                <Card>
                  <CardHeader>
                    <CardTitle>Branding & Appearance</CardTitle>
                    <CardDescription>Customize your church's visual identity</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Church Logo</Label>
                      <div className="mt-2 flex items-center">
                        <div className="h-20 w-20 rounded bg-gray-100 flex items-center justify-center">
                          <Image className="h-10 w-10 text-gray-400" />
                        </div>
                        <div className="ml-4 flex flex-col space-y-2">
                          <Button size="sm">Upload New Logo</Button>
                          <Button size="sm" variant="outline">Remove</Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Recommended size: 512x512px (PNG or SVG)
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Brand Colors</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="primary-color" className="text-xs">Primary Color</Label>
                          <div className="flex mt-1">
                            <div className="h-10 w-10 rounded bg-primary border border-gray-200"></div>
                            <Input id="primary-color" defaultValue="#1a365d" className="flex-1 ml-2" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="secondary-color" className="text-xs">Secondary Color</Label>
                          <div className="flex mt-1">
                            <div className="h-10 w-10 rounded bg-accent border border-gray-200"></div>
                            <Input id="secondary-color" defaultValue="#ecc94b" className="flex-1 ml-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Website Theme</Label>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div className="border rounded-md p-2 cursor-pointer bg-white ring-2 ring-primary">
                          <div className="h-20 bg-gray-100 rounded-md mb-2"></div>
                          <div className="text-sm font-medium">Modern</div>
                        </div>
                        <div className="border rounded-md p-2 cursor-pointer bg-white">
                          <div className="h-20 bg-gray-100 rounded-md mb-2"></div>
                          <div className="text-sm font-medium">Classic</div>
                        </div>
                        <div className="border rounded-md p-2 cursor-pointer bg-white">
                          <div className="h-20 bg-gray-100 rounded-md mb-2"></div>
                          <div className="text-sm font-medium">Minimal</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="font">Primary Font</Label>
                      <Select defaultValue="inter">
                        <SelectTrigger id="font" className="mt-1">
                          <SelectValue placeholder="Select font" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inter">Inter</SelectItem>
                          <SelectItem value="roboto">Roboto</SelectItem>
                          <SelectItem value="opensans">Open Sans</SelectItem>
                          <SelectItem value="lato">Lato</SelectItem>
                          <SelectItem value="montserrat">Montserrat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSave}>Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="modules">
                <Card>
                  <CardHeader>
                    <CardTitle>Module Configuration</CardTitle>
                    <CardDescription>Enable or disable features based on your needs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Sermons & Media</h4>
                          <p className="text-sm text-gray-500">
                            Upload and organize sermon recordings, videos, and notes
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Events Calendar</h4>
                          <p className="text-sm text-gray-500">
                            Schedule and promote church events
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Online Giving</h4>
                          <p className="text-sm text-gray-500">
                            Collect tithes and donations online
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Live Streaming</h4>
                          <p className="text-sm text-gray-500">
                            Stream your services live on your website
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Small Groups</h4>
                          <p className="text-sm text-gray-500">
                            Manage and promote small groups/bible studies
                          </p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Prayer Requests</h4>
                          <p className="text-sm text-gray-500">
                            Allow visitors to submit prayer requests
                          </p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Member Directory</h4>
                          <p className="text-sm text-gray-500">
                            Private directory for church members
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSave}>Save Module Settings</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default TenantManagementSettings;
