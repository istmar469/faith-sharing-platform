
import React, { useCallback } from 'react';
import { usePageBuilder } from './context/PageBuilderContext';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { toast } from 'sonner';
import EditorComponent from './editor/EditorComponent';
import { LayoutGrid } from 'lucide-react';

const PageCanvas: React.FC = () => {
  const { pageElements, setPageElements, savePage, organizationId } = usePageBuilder();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleEditorChange = useCallback((data: any) => {
    // Update the page elements with the Editor.js data
    setPageElements(data.blocks || []);
    
    // Debounce auto-save
    const timeout = setTimeout(() => {
      console.log("Auto-saving after editor change");
      savePage()
        .then(result => {
          if (!result) {
            console.error("Save failed");
          }
        })
        .catch(err => {
          console.error("Save error:", err);
          toast.error("Error saving: " + (err.message || "Unknown error"));
        });
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [setPageElements, savePage]);
  
  // Convert existing pageElements (if any) into Editor.js format
  const initialEditorData = {
    blocks: Array.isArray(pageElements) ? pageElements : []
  };

  return (
    <div className={cn(
      "flex-1 overflow-auto bg-gray-50 p-2 transition-all duration-300", 
      isMobile ? "px-1" : "sm:p-4 md:p-6"
    )}>
      <div 
        className={cn(
          "mx-auto bg-white shadow-sm rounded-lg min-h-full border transition-all duration-200",
          "max-w-full sm:max-w-4xl",
          "border-gray-200 pb-20" // Add padding at bottom for better editing experience
        )}
      >
        {Array.isArray(pageElements) && pageElements.length === 0 ? (
          <div className="h-64 sm:h-96 flex items-center justify-center text-gray-400 flex-col px-4 text-center">
            <LayoutGrid className="h-8 w-8 sm:h-12 sm:w-12 mb-2" />
            <p className="text-sm sm:text-base font-medium mb-1">Start Building Your Page</p>
            <p className="text-xs sm:text-sm">Click below to start writing or adding blocks</p>
          </div>
        ) : null}
        
        <EditorComponent 
          initialData={initialEditorData} 
          onChange={handleEditorChange} 
          organizationId={organizationId || ''}
        />
      </div>
    </div>
  );
};

export default React.memo(PageCanvas);
