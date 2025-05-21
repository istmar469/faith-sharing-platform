
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListTree, Type, Settings } from 'lucide-react';
import ElementsSidebar from './ElementsSidebar';
import { StylesSidebar } from './styles';
import SettingsSidebar from './SettingsSidebar';
import { usePageBuilder } from '../context/PageBuilderContext';

const SidebarContainer: React.FC = () => {
  const { activeTab, setActiveTab } = usePageBuilder();
  
  return (
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
          <TabsContent value="elements">
            <ElementsSidebar />
          </TabsContent>
          
          <TabsContent value="styles">
            <StylesSidebar />
          </TabsContent>
          
          <TabsContent value="settings">
            <SettingsSidebar />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default SidebarContainer;
