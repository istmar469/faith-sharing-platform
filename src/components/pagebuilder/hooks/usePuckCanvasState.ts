
import { useCallback } from 'react';
import { usePageBuilder } from '../context/PageBuilderContext';
import { toast } from 'sonner';

export const usePuckCanvasState = () => {
  const { 
    pageElements, 
    setPageElements, 
    savePage, 
    organizationId, 
    pageId 
  } = usePageBuilder();

  const handlePuckChange = useCallback((data: any) => {
    console.log("PuckCanvas: Puck data change detected", {
      contentCount: data?.content?.length || 0,
      hasRoot: !!data?.root,
      dataType: 'Puck'
    });
    
    // Update the page elements with the Puck data
    setPageElements(data);
    
    // Debounce auto-save
    const timeout = setTimeout(() => {
      console.log("PuckCanvas: Auto-saving Puck content");
      savePage()
        .then(result => {
          if (!result) {
            console.error("PuckCanvas: Save failed");
          } else {
            console.log("PuckCanvas: Auto-save successful");
          }
        })
        .catch(err => {
          console.error("PuckCanvas: Save error:", err);
          toast.error("Error saving: " + (err.message || "Unknown error"));
        });
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [setPageElements, savePage]);

  const handleEditorReady = useCallback(() => {
    console.log("PuckCanvas: Puck editor ready");
  }, []);
  
  // Convert existing pageElements to Puck format if needed
  const initialPuckData = convertToPuckFormat(pageElements);
  
  // Check if we have content - use content array for Puck format
  const hasContent = pageElements && 
    ((pageElements.content && pageElements.content.length > 0) || 
     (pageElements.blocks && pageElements.blocks.length > 0));
  
  return {
    pageElements,
    organizationId,
    isEditorInitializing: false,
    editorError: null,
    showFallback: false,
    hasContent,
    editorKey: 1,
    initialEditorData: initialPuckData,
    handleEditorChange: handlePuckChange,
    handleEditorReady,
    handleRetryEditor: () => {},
    handleShowFallback: () => {}
  };
};

// Helper function to convert data to Puck format
const convertToPuckFormat = (data: any) => {
  if (!data) {
    return { content: [], root: {} };
  }
  
  // If it's already Puck format (has content array and root)
  if (data.content && Array.isArray(data.content) && data.root) {
    return data;
  }
  
  // If it's Editor.js format (has blocks array)
  if (data.blocks && Array.isArray(data.blocks)) {
    console.log("Converting Editor.js format to Puck format");
    return { content: [], root: {} };
  }
  
  // Default empty Puck structure
  return { content: [], root: {} };
};
