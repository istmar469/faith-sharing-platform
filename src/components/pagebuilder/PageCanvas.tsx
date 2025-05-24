
import React, { useCallback } from 'react';
import { usePageBuilder } from './context/PageBuilderContext';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { toast } from 'sonner';
import EditorComponent from './editor/EditorComponent';
import { useEditorState } from './hooks/useEditorState';
import EditorLoadingState from './components/EditorLoadingState';
import EditorErrorState from './components/EditorErrorState';
import EditorEmptyState from './components/EditorEmptyState';
import FallbackEditor from './components/FallbackEditor';

const PageCanvas: React.FC = () => {
  const { 
    pageElements, 
    setPageElements, 
    savePage, 
    organizationId, 
    pageId 
  } = usePageBuilder();
  
  const isMobile = useMediaQuery("(max-width: 768px)");
  
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
  
  console.log("PageCanvas: Rendering with state", {
    organizationId: !!organizationId,
    hasContent,
    isEditorInitializing,
    editorError: !!editorError,
    showFallback
  });

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
          "border-gray-200 pb-20"
        )}
      >
        {/* Loading State */}
        {isEditorInitializing && !showFallback && <EditorLoadingState />}
        
        {/* Error State */}
        {editorError && !isEditorInitializing && !showFallback && (
          <EditorErrorState 
            error={editorError}
            onRetry={handleRetryEditor}
            onShowFallback={handleShowFallback}
          />
        )}
        
        {/* Empty State */}
        {!isEditorInitializing && !editorError && !hasContent && !showFallback && (
          <EditorEmptyState />
        )}
        
        {/* Fallback Simple Editor */}
        {showFallback && (
          <FallbackEditor
            pageElements={pageElements}
            onChange={handleEditorChange}
          />
        )}
        
        {/* Main Editor */}
        {organizationId && !showFallback && (
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
