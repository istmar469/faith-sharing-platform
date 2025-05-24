
import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface UseEditorStateProps {
  organizationId: string | null;
  pageId: string | null;
}

export const useEditorState = ({ organizationId, pageId }: UseEditorStateProps) => {
  const [isEditorLoaded, setIsEditorLoaded] = useState(false);
  const [isEditorInitializing, setIsEditorInitializing] = useState(true);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  const debugId = useRef(`EditorState-${Date.now()}`);

  // Enhanced debug logging
  useEffect(() => {
    console.log(`📊 ${debugId.current}: useEditorState state update`, {
      organizationId,
      pageId,
      isEditorLoaded,
      isEditorInitializing,
      editorError,
      editorKey,
      showFallback,
      timestamp: new Date().toISOString()
    });
  }, [organizationId, pageId, isEditorLoaded, isEditorInitializing, editorError, editorKey, showFallback]);

  // Reset initialization state when organization ID changes
  useEffect(() => {
    if (organizationId) {
      console.log(`🔄 ${debugId.current}: Organization ID changed, resetting editor state`, {
        newOrgId: organizationId,
        pageId
      });
      setIsEditorInitializing(true);
      setEditorError(null);
      setEditorKey(prev => prev + 1);
      setShowFallback(false);
      setIsEditorLoaded(false);
    }
  }, [organizationId, pageId]);

  // Timeout for editor initialization
  useEffect(() => {
    if (!isEditorInitializing) {
      console.log(`⏹️ ${debugId.current}: Editor not initializing, skipping timeout setup`);
      return;
    }

    console.log(`⏰ ${debugId.current}: Setting up editor initialization timeout (20 seconds)`);
    
    // Extended timeout for debugging
    const finalTimeout = setTimeout(() => {
      if (isEditorInitializing) {
        console.error(`⏰ ${debugId.current}: Editor initialization timeout after 20 seconds`);
        setIsEditorInitializing(false);
        setEditorError("Editor initialization timed out after 20 seconds. Please try refreshing the page or use the simple editor.");
        toast.error("Editor loading timed out - try the simple editor option");
      }
    }, 20000);
    
    return () => {
      console.log(`🧹 ${debugId.current}: Clearing editor timeout`);
      clearTimeout(finalTimeout);
    };
  }, [isEditorInitializing]);

  const handleEditorReady = useCallback(() => {
    console.log(`✅ ${debugId.current}: handleEditorReady callback triggered`);
    setIsEditorLoaded(true);
    setIsEditorInitializing(false);
    setEditorError(null);
    toast.success("Editor loaded successfully!");
    console.log(`🎉 ${debugId.current}: Editor ready state updated successfully`);
  }, []);

  const handleRetryEditor = useCallback(() => {
    console.log(`🔄 ${debugId.current}: Retrying editor initialization`);
    setEditorError(null);
    setIsEditorInitializing(true);
    setIsEditorLoaded(false);
    setEditorKey(prev => prev + 1);
  }, []);

  const handleShowFallback = useCallback(() => {
    console.log(`🔄 ${debugId.current}: Switching to fallback editor`);
    setShowFallback(true);
    setIsEditorInitializing(false);
    setEditorError(null);
  }, []);

  return {
    isEditorLoaded,
    isEditorInitializing,
    editorError,
    editorKey,
    showFallback,
    handleEditorReady,
    handleRetryEditor,
    handleShowFallback
  };
};
