
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Type, Settings, ChevronRight, ChevronLeft, FileText, Layout, Navigation } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StylesSidebar } from './styles';
import SettingsSidebar from './SettingsSidebar';
import PagesSidebar from './PagesSidebar';
import TemplatesSidebar from './TemplatesSidebar';
import NavigationSidebar from './NavigationSidebar';
import { usePageBuilder } from '../context/PageBuilderContext';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const SidebarContainer: React.FC = () => {
  const { activeTab, setActiveTab } = usePageBuilder();
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Auto-collapse on mobile by default
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  }, [isMobile]);

  return (
    <div className={cn(
      "bg-white border-r flex flex-col relative transition-all duration-300 h-full site-builder-sidebar",
      collapsed ? "w-12" : "w-64 md:w-72"
    )}>
      {/* Collapse toggle button */}
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute -left-3 top-16 z-50 h-6 w-6 rounded-full border p-0",
          "flex items-center justify-center bg-white shadow-sm"
        )}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
      
      <TooltipProvider>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          {!collapsed ? (
            <TabsList className="grid grid-cols-5 px-2 py-2">
              <TabsTrigger value="pages" className="py-1 px-1">
                <FileText className="h-4 w-4 mr-1" /> Pages
              </TabsTrigger>
              <TabsTrigger value="templates" className="py-1 px-1">
                <Layout className="h-4 w-4 mr-1" /> Templates
              </TabsTrigger>
              <TabsTrigger value="navigation" className="py-1 px-1">
                <Navigation className="h-4 w-4 mr-1" /> Nav
              </TabsTrigger>
              <TabsTrigger value="styles" className="py-1 px-1">
                <Type className="h-4 w-4 mr-1" /> Styles
              </TabsTrigger>
              <TabsTrigger value="settings" className="py-1 px-1">
                <Settings className="h-4 w-4 mr-1" /> Settings
              </TabsTrigger>
            </TabsList>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTab === "pages" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setActiveTab("pages")}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">Pages</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTab === "templates" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setActiveTab("templates")}
                  >
                    <Layout className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">Templates</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTab === "navigation" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setActiveTab("navigation")}
                  >
                    <Navigation className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">Navigation</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTab === "styles" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setActiveTab("styles")}
                  >
                    <Type className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">Styles</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTab === "settings" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setActiveTab("settings")}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">Settings</TooltipContent>
              </Tooltip>
            </div>
          )}
          
          {!collapsed && (
            <ScrollArea className="flex-1">
              <TabsContent value="pages" className="p-0 m-0">
                <PagesSidebar />
              </TabsContent>
              
              <TabsContent value="templates" className="p-0 m-0">
                <TemplatesSidebar />
              </TabsContent>
              
              <TabsContent value="navigation" className="p-0 m-0">
                <NavigationSidebar />
              </TabsContent>
              
              <TabsContent value="styles" className="p-0 m-0">
                <StylesSidebar />
              </TabsContent>
              
              <TabsContent value="settings" className="p-0 m-0">
                <SettingsSidebar />
              </TabsContent>
            </ScrollArea>
          )}
        </Tabs>
      </TooltipProvider>
    </div>
  );
};

export default SidebarContainer;
