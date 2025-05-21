
import React from 'react';
import { LayoutGrid, Image } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { usePageBuilder } from './context/PageBuilderContext';

const PageCanvas: React.FC = () => {
  const { pageElements, selectedElementId, setSelectedElementId } = usePageBuilder();

  const handleElementClick = (id: string) => {
    setSelectedElementId(id);
  };
  
  return (
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
  );
};

export default PageCanvas;
