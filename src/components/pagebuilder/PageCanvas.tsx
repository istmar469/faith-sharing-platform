
import React, { useCallback, useEffect, useState } from 'react';
import { usePageBuilder } from './context/PageBuilderContext';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { toast } from 'sonner';
import EditorComponent from './editor/EditorComponent';
import { LayoutGrid, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [editorKey, setEditorKey] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [showFallback, setShowFallback] = useState(false);

  // Enhanced debug logging
  useEffect(() => {
    console.log("=== PageCanvas Debug Info ===");
    console.log("PageCanvas: Current state", {
      organizationId,
      pageId,
      hasPageElements: !!pageElements,
      pageElementsBlocksCount: pageElements?.blocks?.length || 0,
      isEditorLoaded,
      isEditorInitializing,
      editorError,
      editorKey,
      retryCount,
      timestamp: new Date().toISOString()
    });
  }, [organizationId, pageId, pageElements, isEditorLoaded, isEditorInitializing, editorError, editorKey, retryCount]);

  // Reset initialization state when organization ID changes
  useEffect(() => {
    if (organizationId) {
      console.log("PageCanvas: Organization ID changed, resetting editor state");
      setIsEditorInitializing(true);
      setEditorError(null);
      setEditorKey(prev => prev + 1);
      setRetryCount(0);
      setShowFallback(false);
    }
  }, [organizationId, pageId]);

  // Enhanced timeout with progressive messaging
  useEffect(() => {
    if (!isEditorInitializing) return;

    console.log("PageCanvas: Starting editor initialization timeout");
    
    // First warning at 10 seconds
    const warningTimeout = setTimeout(() => {
      if (isEditorInitializing) {
        console.warn("PageCanvas: Editor taking longer than expected...");
        toast("Editor is taking longer than expected. Please wait...");
      }
    }, 10000);

    // Final timeout at 15 seconds
    const finalTimeout = setTimeout(() => {
      if (isEditorInitializing) {
        console.error("PageCanvas: Editor initialization timeout after 15 seconds");
        setIsEditorInitializing(false);
        setEditorError("Editor initialization timed out. This might be due to a slow connection or browser issues.");
        setRetryCount(prev => prev + 1);
        
        // Show fallback after 2 failed attempts
        if (retryCount >= 1) {
          setShowFallback(true);
        }
      }
    }, 15000);
    
    return () => {
      clearTimeout(warningTimeout);
      clearTimeout(finalTimeout);
    };
  }, [isEditorInitializing, retryCount]);

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
  
  const handleEditorReady = useCallback(() => {
    console.log("PageCanvas: Editor ready callback triggered");
    setIsEditorLoaded(true);
    setIsEditorInitializing(false);
    setEditorError(null);
    setRetryCount(0);
    toast.success("Editor loaded successfully!");
  }, []);

  const handleRetryEditor = useCallback(() => {
    console.log("PageCanvas: Retrying editor initialization");
    setEditorError(null);
    setIsEditorInitializing(true);
    setIsEditorLoaded(false);
    setEditorKey(prev => prev + 1);
    setRetryCount(prev => prev + 1);
  }, []);

  const handleShowFallback = useCallback(() => {
    console.log("PageCanvas: Showing fallback editor");
    setShowFallback(true);
    setIsEditorInitializing(false);
    setEditorError(null);
  }, []);
  
  // Convert existing pageElements (if any) into Editor.js format
  const initialEditorData = pageElements || { blocks: [] };
  
  // Check if we have content - use blocks array for EditorJS format
  const hasContent = pageElements && pageElements.blocks && pageElements.blocks.length > 0;
  
  console.log("PageCanvas: Rendering with state", {
    organizationId: !!organizationId,
    hasContent,
    isEditorInitializing,
    editorError: !!editorError,
    showFallback,
    retryCount
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
        {isEditorInitializing && !showFallback && (
          <div className="h-64 sm:h-96 flex items-center justify-center text-gray-400 flex-col px-4 text-center">
            <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 mb-2 animate-spin" />
            <p className="text-sm sm:text-base font-medium mb-1">Initializing Editor</p>
            <p className="text-xs sm:text-sm">Loading editing tools...</p>
            {retryCount > 0 && (
              <p className="text-xs text-amber-600 mt-2">Retry attempt {retryCount}</p>
            )}
          </div>
        )}
        
        {/* Error State */}
        {editorError && !isEditorInitializing && !showFallback && (
          <div className="h-64 sm:h-96 flex items-center justify-center text-amber-600 flex-col px-4 text-center">
            <AlertTriangle className="h-8 w-8 sm:h-12 sm:w-12 mb-2" />
            <p className="text-sm sm:text-base font-medium mb-1">Editor Loading Issue</p>
            <p className="text-xs sm:text-sm mb-4">{editorError}</p>
            <div className="space-x-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={handleRetryEditor}
              >
                Retry Editor
              </Button>
              {retryCount >= 1 && (
                <Button 
                  variant="secondary"
                  size="sm"
                  onClick={handleShowFallback}
                >
                  Use Simple Editor
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {!isEditorInitializing && !editorError && !hasContent && !showFallback && (
          <div className="h-64 sm:h-96 flex items-center justify-center text-gray-400 flex-col px-4 text-center">
            <LayoutGrid className="h-8 w-8 sm:h-12 sm:w-12 mb-2" />
            <p className="text-sm sm:text-base font-medium mb-1">Start Building Your Page</p>
            <p className="text-xs sm:text-sm">Click below to start writing</p>
          </div>
        )}
        
        {/* Fallback Simple Editor */}
        {showFallback && (
          <div className="p-4">
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800">
                Using simplified editor mode. Some features may be limited.
              </p>
            </div>
            <textarea
              className="w-full min-h-[400px] p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Start writing your content here..."
              defaultValue={JSON.stringify(pageElements, null, 2)}
              onChange={(e) => {
                try {
                  const data = JSON.parse(e.target.value);
                  handleEditorChange(data);
                } catch (err) {
                  // Invalid JSON, ignore
                }
              }}
            />
          </div>
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
