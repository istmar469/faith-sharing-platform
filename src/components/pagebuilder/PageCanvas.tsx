
import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { usePageBuilder } from './context/PageBuilderContext';
import PageElement from './elements/PageElement';

const PageCanvas: React.FC = () => {
  const { pageElements, selectedElementId, setSelectedElementId, addElement } = usePageBuilder();

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
    <div className="flex-1 overflow-auto bg-gray-50 p-6">
      <div 
        className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg min-h-full border"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {topLevelElements.length === 0 ? (
          <div className="h-96 flex items-center justify-center text-gray-400 flex-col">
            <LayoutGrid className="h-12 w-12 mb-2" />
            <p>Drag elements from the sidebar to build your page</p>
          </div>
        ) : (
          <div className="p-4">
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
