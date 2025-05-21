
import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { usePageBuilder } from './context/PageBuilderContext';
import PageElement from './elements/PageElement';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';

const PageCanvas: React.FC = () => {
  const { pageElements, selectedElementId, setSelectedElementId, addElement, activeTab } = usePageBuilder();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const handleElementClick = (id: string) => {
    setSelectedElementId(id);
  };

  // Handle drop of elements onto the canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const jsonData = e.dataTransfer.getData('application/json');
    
    if (jsonData) {
      try {
        const elementData = JSON.parse(jsonData);
        // Add element with null parentId (top level)
        addElement({
          ...elementData,
          parentId: null
        });
      } catch (error) {
        console.error("Error parsing dragged element data:", error);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };
  
  // Get only top-level elements (no parent)
  const topLevelElements = pageElements.filter(element => !element.parentId);
  
  return (
    <div className={cn(
      "flex-1 overflow-auto bg-gray-50 p-2 transition-all duration-300", 
      isMobile ? "px-1" : "sm:p-4 md:p-6"
    )}>
      <div 
        className={cn(
          "mx-auto bg-white shadow-sm rounded-lg min-h-full border",
          "transition-all duration-300",
          "max-w-full sm:max-w-4xl"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {topLevelElements.length === 0 ? (
          <div className="h-64 sm:h-96 flex items-center justify-center text-gray-400 flex-col px-4 text-center">
            <LayoutGrid className="h-8 w-8 sm:h-12 sm:w-12 mb-2" />
            <p className="text-sm sm:text-base">Drag elements from the sidebar to build your page</p>
          </div>
        ) : (
          <div className="p-2 sm:p-4">
            {topLevelElements.map((element) => (
              <PageElement 
                key={element.id}
                element={element}
                isSelected={element.id === selectedElementId}
                onClick={() => handleElementClick(element.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageCanvas;
