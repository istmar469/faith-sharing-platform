
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Settings } from 'lucide-react';
import { StylesSidebar } from './styles';
import { usePageBuilder } from '../context/PageBuilderContext';

const RightSettingsPanel: React.FC = () => {
  const { selectedElementId, pageElements } = usePageBuilder();
  const selectedElement = pageElements.find(element => element.id === selectedElementId);

  if (!selectedElement) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4 flex flex-col items-center justify-center text-gray-400">
        <Settings className="h-12 w-12 mb-4" />
        <h3 className="text-lg font-medium mb-2">No Element Selected</h3>
        <p className="text-center text-sm">
          Click on an element in the canvas to edit its properties
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
        <Badge variant="outline" className="text-xs">
          {selectedElement.component}
        </Badge>
      </div>
      
      <ScrollArea className="flex-1">
        <StylesSidebar />
      </ScrollArea>
    </div>
  );
};

export default RightSettingsPanel;
