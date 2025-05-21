
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListTree, Type, Settings, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ElementsSidebar from './ElementsSidebar';
import { StylesSidebar } from './styles';
import SettingsSidebar from './SettingsSidebar';
import { usePageBuilder } from '../context/PageBuilderContext';
import { useMediaQuery } from '@/hooks/use-media-query';

const SidebarContainer: React.FC = () => {
  const { activeTab, setActiveTab } = usePageBuilder();
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Auto-collapse on mobile by default
  React.useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  return (
    <div className={cn(
      "bg-white border-l flex flex-col relative transition-all duration-300",
      collapsed ? "w-12" : "w-64"
    )}>
      {/* Collapse toggle button */}
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute -left-3 top-16 z-50 h-6 w-6 rounded-full border p-0",
          "flex items-center justify-center"
        )}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        {!collapsed ? (
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
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <Button
              variant={activeTab === "elements" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setActiveTab("elements")}
            >
              <ListTree className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTab === "styles" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setActiveTab("styles")}
            >
              <Type className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTab === "settings" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {!collapsed && (
          <ScrollArea className="flex-1">
            <TabsContent value="elements" className="p-0 m-0">
              <ElementsSidebar />
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
    </div>
  );
};

export default SidebarContainer;
