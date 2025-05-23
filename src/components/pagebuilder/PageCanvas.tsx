
import React, { useCallback, useEffect, useState } from 'react';
import { usePageBuilder } from './context/PageBuilderContext';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { toast } from 'sonner';
import EditorComponent from './editor/EditorComponent';
import { LayoutGrid, Loader2 } from 'lucide-react';

const PageCanvas: React.FC = () => {
  const { 
    pageElements, 
    setPageElements, 
    savePage, 
    organizationId, 
    pageId 
  } = usePageBuilder();
  
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isEditorLoaded, setIsEditorLoaded] = useState(false);
  const [isEditorInitializing, setIsEditorInitializing] = useState(true);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0); // Added to force editor recreation when needed

  // Reset initialization state when organization ID changes
  useEffect(() => {
    if (organizationId) {
      setIsEditorInitializing(true);
      setEditorError(null);
      setEditorKey(prev => prev + 1); // Force editor recreation
    }
  }, [organizationId, pageId]);

  useEffect(() => {
    // Set a timeout to prevent getting stuck in initializing state
    const timeout = setTimeout(() => {
      if (isEditorInitializing) {
        setIsEditorInitializing(false);
        setEditorError("Editor initialization timed out. Try reloading the page.");
        toast.error("Editor initialization timed out");
      }
    }, 7000); // Reduced from 10 seconds
    
    return () => clearTimeout(timeout);
  }, [isEditorInitializing]);

  const handleEditorChange = useCallback((data: any) => {
    console.log("Editor change detected, updating page elements", data);
    
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
  
  const handleEditorReady = useCallback(() => {
    console.log("Editor is ready");
    setIsEditorLoaded(true);
    setIsEditorInitializing(false);
  }, []);
  
  // Convert existing pageElements (if any) into Editor.js format
  const initialEditorData = {
    blocks: Array.isArray(pageElements) ? pageElements : []
  };
  
  console.log("PageCanvas rendering with organization ID:", organizationId, "page elements:", pageElements?.length);

  if (!organizationId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-red-500">Error: Missing organization ID</p>
      </div>
    );
  }

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
        {isEditorInitializing && (
          <div className="h-64 sm:h-96 flex items-center justify-center text-gray-400 flex-col px-4 text-center">
            <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 mb-2 animate-spin" />
            <p className="text-sm sm:text-base font-medium mb-1">Initializing Editor</p>
            <p className="text-xs sm:text-sm">Please wait while the editor loads</p>
          </div>
        )}
        
        {editorError && (
          <div className="h-64 sm:h-96 flex items-center justify-center text-red-500 flex-col px-4 text-center">
            <p className="text-sm sm:text-base font-medium mb-1">Failed to initialize editor</p>
            <p className="text-xs sm:text-sm">{editorError}</p>
            <button 
              className="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              onClick={() => {
                setEditorError(null);
                setIsEditorInitializing(true);
                setEditorKey(prev => prev + 1); // Force editor recreation
              }}
            >
              Try Again
            </button>
          </div>
        )}
        
        {!isEditorInitializing && !editorError && Array.isArray(pageElements) && pageElements.length === 0 && (
          <div className="h-64 sm:h-96 flex items-center justify-center text-gray-400 flex-col px-4 text-center">
            <LayoutGrid className="h-8 w-8 sm:h-12 sm:w-12 mb-2" />
            <p className="text-sm sm:text-base font-medium mb-1">Start Building Your Page</p>
            <p className="text-xs sm:text-sm">Click below to start writing or adding blocks</p>
          </div>
        )}
        
        {!editorError && organizationId && (
          <div key={editorKey}>
            <EditorComponent 
              initialData={initialEditorData} 
              onChange={handleEditorChange}
              onReady={handleEditorReady} 
              organizationId={organizationId}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(PageCanvas);
