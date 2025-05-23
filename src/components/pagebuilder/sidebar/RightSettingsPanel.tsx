
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Settings, Type, Palette, Layout } from 'lucide-react';
import { StylesSidebar } from './styles';
import { usePageBuilder } from '../context/PageBuilderContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ElementPropertiesPanel from './ElementPropertiesPanel';

const RightSettingsPanel: React.FC = () => {
  const { selectedElementId, pageElements } = usePageBuilder();
  const selectedElement = pageElements.find(element => element.id === selectedElementId);

  if (!selectedElement) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4 flex flex-col items-center justify-center text-gray-400">
        <Settings className="h-12 w-12 mb-4" />
        <h3 className="text-lg font-medium mb-2">No Element Selected</h3>
        <p className="text-center text-sm">
          Click on an element in the canvas to edit its properties and styles
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="h-5 w-5" />
          <h3 className="font-medium">Element Settings</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {selectedElement.component}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            ID: {selectedElement.id.slice(0, 8)}...
          </Badge>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="w-full mx-4 mt-4">
            <TabsTrigger value="properties" className="flex-1 text-xs">
              <Type className="h-3 w-3 mr-1" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="styles" className="flex-1 text-xs">
              <Palette className="h-3 w-3 mr-1" />
              Styles
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="properties" className="mt-0">
            <ElementPropertiesPanel />
          </TabsContent>
          
          <TabsContent value="styles" className="mt-0">
            <StylesSidebar />
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
};

export default RightSettingsPanel;
