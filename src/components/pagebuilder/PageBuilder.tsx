
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayoutGrid, Type, Image, ListTree, Columns, Square, Heading, Paragraph, FileText, Settings, Save } from 'lucide-react';
import SideNav from '../dashboard/SideNav';

const PageBuilder = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("elements");
  const [pageTitle, setPageTitle] = useState<string>("New Page");
  
  const handleSave = () => {
    toast({
      title: "Page Saved",
      description: "Your page has been saved successfully",
    });
  };
  
  // Mock page elements for demo
  const pageElements = [
    { type: 'header', component: 'Hero Section' },
    { type: 'text', component: 'Text Block' },
    { type: 'image', component: 'Image Gallery' }
  ];
  
  return (
    <div className="flex h-screen bg-gray-100">
      <SideNav />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm z-10">
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Input 
                className="text-xl font-bold h-10 px-3 w-64 bg-white border-none"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
              />
              <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
                Draft
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Preview
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" /> Save
              </Button>
            </div>
          </div>
        </header>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Main canvas */}
          <div className="flex-1 overflow-auto bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg min-h-full border">
              {pageElements.length === 0 ? (
                <div className="h-96 flex items-center justify-center text-gray-400 flex-col">
                  <LayoutGrid className="h-12 w-12 mb-2" />
                  <p>Drag elements from the sidebar to build your page</p>
                </div>
              ) : (
                <>
                  <div className="p-8 border-b bg-gray-50 flex items-center justify-center">
                    <h1 className="text-3xl font-bold">Hero Section</h1>
                  </div>
                  <div className="p-8 border-b">
                    <h2 className="text-2xl font-semibold mb-4">Welcome to Our Church</h2>
                    <p className="text-gray-600 mb-4">
                      We are a vibrant community of believers dedicated to serving God and our community. 
                      Join us for worship services, community outreach, and spiritual growth.
                    </p>
                    <div className="flex space-x-4">
                      <Button>Learn More</Button>
                      <Button variant="outline">Join Us</Button>
                    </div>
                  </div>
                  <div className="p-8 grid grid-cols-3 gap-4">
                    <div className="bg-gray-100 h-40 rounded flex items-center justify-center text-gray-400">
                      <Image className="h-8 w-8" />
                    </div>
                    <div className="bg-gray-100 h-40 rounded flex items-center justify-center text-gray-400">
                      <Image className="h-8 w-8" />
                    </div>
                    <div className="bg-gray-100 h-40 rounded flex items-center justify-center text-gray-400">
                      <Image className="h-8 w-8" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Right sidebar */}
          <div className="w-64 bg-white border-l flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid grid-cols-3 px-2 py-2">
                <TabsTrigger value="elements" className="py-1 px-2">
                  <ListTree className="h-4 w-4 mr-1" /> Elements
                </TabsTrigger>
                <TabsTrigger value="styles" className="py-1 px-2">
                  <Type className="h-4 w-4 mr-1" /> Styles
                </TabsTrigger>
                <TabsTrigger value="settings" className="py-1 px-2">
                  <Settings className="h-4 w-4 mr-1" /> Settings
                </TabsTrigger>
              </TabsList>
              
              <ScrollArea className="flex-1">
                <TabsContent value="elements" className="p-2 space-y-4 mt-0">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Layout Blocks</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-2 text-center">
                          <Columns className="h-6 w-6 mb-1 mx-auto text-gray-600" />
                          <span className="text-xs">Section</span>
                        </CardContent>
                      </Card>
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-2 text-center">
                          <LayoutGrid className="h-6 w-6 mb-1 mx-auto text-gray-600" />
                          <span className="text-xs">Grid</span>
                        </CardContent>
                      </Card>
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-2 text-center">
                          <Square className="h-6 w-6 mb-1 mx-auto text-gray-600" />
                          <span className="text-xs">Container</span>
                        </CardContent>
                      </Card>
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-2 text-center">
                          <FileText className="h-6 w-6 mb-1 mx-auto text-gray-600" />
                          <span className="text-xs">Card</span>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Content Elements</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-2 text-center">
                          <Heading className="h-6 w-6 mb-1 mx-auto text-gray-600" />
                          <span className="text-xs">Heading</span>
                        </CardContent>
                      </Card>
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-2 text-center">
                          <Paragraph className="h-6 w-6 mb-1 mx-auto text-gray-600" />
                          <span className="text-xs">Paragraph</span>
                        </CardContent>
                      </Card>
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-2 text-center">
                          <Image className="h-6 w-6 mb-1 mx-auto text-gray-600" />
                          <span className="text-xs">Image</span>
                        </CardContent>
                      </Card>
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-2 text-center">
                          <Button className="h-6 w-full mb-1 mx-auto text-xs">Button</Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Church Elements</h3>
                    <div className="space-y-2">
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-2 flex items-center">
                          <div className="bg-gray-100 h-8 w-12 rounded mr-2 flex items-center justify-center">
                            <Save className="h-4 w-4 text-gray-600" />
                          </div>
                          <span className="text-xs">Donation Form</span>
                        </CardContent>
                      </Card>
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-2 flex items-center">
                          <div className="bg-gray-100 h-8 w-12 rounded mr-2 flex items-center justify-center">
                            <Video className="h-4 w-4 text-gray-600" />
                          </div>
                          <span className="text-xs">Sermon Player</span>
                        </CardContent>
                      </Card>
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-2 flex items-center">
                          <div className="bg-gray-100 h-8 w-12 rounded mr-2 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-gray-600" />
                          </div>
                          <span className="text-xs">Events Calendar</span>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="styles" className="p-4 mt-0">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs font-semibold text-gray-500 uppercase mb-2">Typography</Label>
                      <div className="space-y-2">
                        <Select defaultValue="inter">
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select font" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inter">Inter</SelectItem>
                            <SelectItem value="roboto">Roboto</SelectItem>
                            <SelectItem value="opensans">Open Sans</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Size</Label>
                            <Select defaultValue="md">
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sm">Small</SelectItem>
                                <SelectItem value="md">Medium</SelectItem>
                                <SelectItem value="lg">Large</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Weight</Label>
                            <Select defaultValue="normal">
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select weight" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="bold">Bold</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs font-semibold text-gray-500 uppercase mb-2">Colors</Label>
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs">Text Color</Label>
                          <div className="flex mt-1">
                            <div className="h-6 w-6 rounded bg-gray-900 border border-gray-200"></div>
                            <Input defaultValue="#1a202c" className="h-6 flex-1 ml-2" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Background</Label>
                          <div className="flex mt-1">
                            <div className="h-6 w-6 rounded bg-white border border-gray-200"></div>
                            <Input defaultValue="#ffffff" className="h-6 flex-1 ml-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs font-semibold text-gray-500 uppercase mb-2">Spacing</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Padding</Label>
                          <Input type="number" defaultValue="16" className="h-8" />
                        </div>
                        <div>
                          <Label className="text-xs">Margin</Label>
                          <Input type="number" defaultValue="0" className="h-8" />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="p-4 mt-0">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="page-url">Page URL</Label>
                      <Input id="page-url" defaultValue="/new-page" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="meta-title">Meta Title</Label>
                      <Input id="meta-title" defaultValue="New Page | First Baptist Church" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="meta-desc">Meta Description</Label>
                      <Textarea id="meta-desc" className="mt-1" rows={3} defaultValue="Welcome to our new page at First Baptist Church. Learn more about our community and services." />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="page-visibility">Published</Label>
                      <Switch id="page-visibility" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="page-index">Show in Navigation</Label>
                      <Switch id="page-index" defaultChecked />
                    </div>
                    <div>
                      <Label htmlFor="page-parent">Parent Page</Label>
                      <Select defaultValue="none">
                        <SelectTrigger id="page-parent">
                          <SelectValue placeholder="Select parent page" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="about">About</SelectItem>
                          <SelectItem value="ministries">Ministries</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageBuilder;

// Import calendar icon
function Calendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

// Import video icon
function Video(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  );
}
