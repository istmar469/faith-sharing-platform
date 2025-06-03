import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Type, Settings, ChevronRight, ChevronLeft, FileText, Layout, Navigation, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
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
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const isLargeScreen = useMediaQuery("(min-width: 1440px)");
  
  // Auto-collapse on mobile and tablet by default
  useEffect(() => {
    if (isMobile || isTablet) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  }, [isMobile, isTablet]);

  // Determine sidebar width based on screen size and collapsed state
  const getSidebarWidth = () => {
    if (collapsed) return "w-16";
    if (isLargeScreen) return "w-80";
    if (isTablet) return "w-72";
    return "w-64";
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={cn(
      "bg-white border-r flex flex-col relative transition-all duration-300 h-full site-builder-sidebar",
      getSidebarWidth()
    )}>
      {/* Enhanced header with collapse toggle */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <span className="font-medium text-sm text-gray-900">
              {activeTab === 'pages' && 'Pages'}
              {activeTab === 'templates' && 'Templates'}
              {activeTab === 'navigation' && 'Navigation'}
              {activeTab === 'styles' && 'Styles'}
              {activeTab === 'settings' && 'Settings'}
            </span>
          </div>
        )}
        
        {/* Prominent collapse toggle button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleCollapse}
              className={cn(
                "h-8 w-8 rounded-md p-0 hover:bg-gray-200 transition-colors",
                collapsed && "mx-auto"
              )}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4 text-gray-600" />
              ) : (
                <PanelLeftClose className="h-4 w-4 text-gray-600" />
              )}
              <span className="sr-only">
                {collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side={collapsed ? "right" : "bottom"}>
            {collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          </TooltipContent>
        </Tooltip>
      </div>
      
      <TooltipProvider>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          {!collapsed ? (
            <div className="border-b border-gray-200 p-2">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="pages" className="py-2 px-2 text-xs data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                  <FileText className="h-4 w-4 mr-1" /> 
                  <span className="hidden sm:inline">Pages</span>
                </TabsTrigger>
                <TabsTrigger value="templates" className="py-2 px-2 text-xs">
                  <Layout className="h-4 w-4 mr-1" /> 
                  <span className="hidden sm:inline">Templates</span>
                </TabsTrigger>
                <TabsTrigger value="navigation" className="py-2 px-2 text-xs">
                  <Navigation className="h-4 w-4 mr-1" /> 
                  <span className="hidden sm:inline">Nav</span>
                </TabsTrigger>
                <TabsTrigger value="styles" className="py-2 px-2 text-xs">
                  <Type className="h-4 w-4 mr-1" /> 
                  <span className="hidden sm:inline">Styles</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="py-2 px-2 text-xs">
                  <Settings className="h-4 w-4 mr-1" /> 
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-3 border-b border-gray-200">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTab === "pages" ? "default" : "ghost"}
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setActiveTab("pages")}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Pages</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTab === "templates" ? "default" : "ghost"}
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setActiveTab("templates")}
                  >
                    <Layout className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Templates</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTab === "navigation" ? "default" : "ghost"}
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setActiveTab("navigation")}
                  >
                    <Navigation className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Navigation</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTab === "styles" ? "default" : "ghost"}
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setActiveTab("styles")}
                  >
                    <Type className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Styles</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTab === "settings" ? "default" : "ghost"}
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setActiveTab("settings")}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
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
