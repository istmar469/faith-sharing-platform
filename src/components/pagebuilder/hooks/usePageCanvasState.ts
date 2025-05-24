
import { useCallback } from 'react';
import { usePageBuilder } from '../context/PageBuilderContext';
import { toast } from 'sonner';

export const usePageCanvasState = () => {
  const { 
    pageElements, 
    setPageElements, 
    savePage, 
    organizationId, 
    pageId 
  } = usePageBuilder();

  const handleEditorChange = useCallback((data: any) => {
    console.log("PageCanvas: Editor.js change detected", {
      blocksCount: data?.blocks?.length || 0,
      hasTime: !!data?.time,
      hasVersion: !!data?.version
    });
    
    // Update the page elements with the Editor.js data
    setPageElements(data);
    
    // Debounce auto-save
    const timeout = setTimeout(() => {
      console.log("PageCanvas: Auto-saving Editor.js content");
      savePage()
        .then(result => {
          if (!result) {
            console.error("PageCanvas: Save failed");
          } else {
            console.log("PageCanvas: Auto-save successful");
          }
        })
        .catch(err => {
          console.error("PageCanvas: Save error:", err);
          toast.error("Error saving: " + (err.message || "Unknown error"));
        });
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [setPageElements, savePage]);

  const handleEditorReady = useCallback(() => {
    console.log("PageCanvas: Editor ready");
  }, []);
  
  // Convert existing pageElements (if any) into Editor.js format
  const initialEditorData = pageElements || { 
    time: Date.now(),
    blocks: [],
    version: "2.30.8"
  };
  
  // Check if we have content - use blocks array for EditorJS format
  const hasContent = pageElements && pageElements.blocks && pageElements.blocks.length > 0;
  
  return {
    pageElements,
    organizationId,
    isEditorInitializing: false, // Simplified - let editor handle its own loading
    editorError: null, // Simplified - let editor handle its own errors
    showFallback: false, // Simplified - let editor handle fallback
    hasContent,
    editorKey: 1, // Static key since we're not recreating editor
    initialEditorData,
    handleEditorChange,
    handleEditorReady,
    handleRetryEditor: () => {}, // No-op - editor handles retries internally
    handleShowFallback: () => {} // No-op - editor handles fallback internally
  };
};
