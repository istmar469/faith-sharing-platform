
import { useCallback } from 'react';
import { usePageBuilder } from '../context/PageBuilderContext';
import { useEditorState } from './useEditorState';
import { toast } from 'sonner';

export const usePageCanvasState = () => {
  const { 
    pageElements, 
    setPageElements, 
    savePage, 
    organizationId, 
    pageId 
  } = usePageBuilder();
  
  const {
    isEditorLoaded,
    isEditorInitializing,
    editorError,
    editorKey,
    showFallback,
    handleEditorReady,
    handleRetryEditor,
    handleShowFallback
  } = useEditorState({ organizationId, pageId });

  const handleEditorChange = useCallback((data: any) => {
    console.log("PageCanvas: Editor change detected", {
      blocksCount: data?.blocks?.length || 0,
      data
    });
    
    // Update the page elements with the Editor.js data
    setPageElements(data);
    
    // Debounce auto-save
    const timeout = setTimeout(() => {
      console.log("PageCanvas: Auto-saving after editor change");
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
  
  // Convert existing pageElements (if any) into Editor.js format
  const initialEditorData = pageElements || { blocks: [] };
  
  // Check if we have content - use blocks array for EditorJS format
  const hasContent = pageElements && pageElements.blocks && pageElements.blocks.length > 0;
  
  return {
    pageElements,
    organizationId,
    isEditorLoaded,
    isEditorInitializing,
    editorError,
    editorKey,
    showFallback,
    handleEditorReady,
    handleRetryEditor,
    handleShowFallback,
    handleEditorChange,
    initialEditorData,
    hasContent
  };
};
