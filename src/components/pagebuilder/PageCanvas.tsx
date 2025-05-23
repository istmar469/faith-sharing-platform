
import React, { useCallback, useRef, useMemo } from 'react';
import { LayoutGrid } from 'lucide-react';
import { usePageBuilder } from './context/PageBuilderContext';
import PageElement from './elements/PageElement';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { toast } from 'sonner';

const PageCanvas: React.FC = () => {
  const { pageElements, selectedElementId, setSelectedElementId, addElement } = usePageBuilder();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const dragOverRef = useRef<boolean>(false);
  
  const handleElementClick = useCallback((id: string) => {
    console.log("Canvas: Element clicked:", id);
    setSelectedElementId(id);
  }, [setSelectedElementId]);

  // Handle drop of elements onto the canvas
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragOverRef.current = false;
    
    try {
      const jsonData = e.dataTransfer.getData('application/json');
      
      if (jsonData) {
        const elementData = JSON.parse(jsonData);
        // Add element with null parentId (top level)
        addElement({
          ...elementData,
          parentId: null
        });
        
        toast.success("Element added successfully");
      }
    } catch (error) {
      console.error("Error parsing dragged element data:", error);
      toast.error("Error adding element");
    }
  }, [addElement]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    dragOverRef.current = true;
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only update if we're actually leaving the drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      dragOverRef.current = false;
    }
  }, []);
  
  // Get only top-level elements (no parent) - memoized for performance
  const topLevelElements = useMemo(() => 
    pageElements.filter(element => !element.parentId),
    [pageElements]
  );
  
  return (
    <div className={cn(
      "flex-1 overflow-auto bg-gray-50 p-2 transition-all duration-300", 
      isMobile ? "px-1" : "sm:p-4 md:p-6"
    )}>
      <div 
        className={cn(
          "mx-auto bg-white shadow-sm rounded-lg min-h-full border transition-all duration-200",
          "max-w-full sm:max-w-4xl",
          dragOverRef.current ? "border-blue-400 border-2 bg-blue-50" : "border-gray-200"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {topLevelElements.length === 0 ? (
          <div className="h-64 sm:h-96 flex items-center justify-center text-gray-400 flex-col px-4 text-center">
            <LayoutGrid className="h-8 w-8 sm:h-12 sm:w-12 mb-2" />
            <p className="text-sm sm:text-base font-medium mb-1">Start Building Your Page</p>
            <p className="text-xs sm:text-sm">Drag elements from the sidebar to build your page</p>
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

export default React.memo(PageCanvas);
