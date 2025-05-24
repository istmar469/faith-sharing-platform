
import { useState, useCallback, useEffect } from 'react';
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

  // Enhanced debug logging
  useEffect(() => {
    console.log("=== useEditorState Debug Info ===");
    console.log("useEditorState: Current state", {
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
      console.log("useEditorState: Organization ID changed, resetting editor state");
      setIsEditorInitializing(true);
      setEditorError(null);
      setEditorKey(prev => prev + 1);
      setShowFallback(false);
      setIsEditorLoaded(false);
    }
  }, [organizationId, pageId]);

  // Timeout for editor initialization
  useEffect(() => {
    if (!isEditorInitializing) return;

    console.log("useEditorState: Starting editor initialization timeout");
    
    // Final timeout at 15 seconds to match EditorComponent
    const finalTimeout = setTimeout(() => {
      if (isEditorInitializing) {
        console.error("useEditorState: Editor initialization timeout after 15 seconds");
        setIsEditorInitializing(false);
        setEditorError("Editor initialization timed out. Please try refreshing the page.");
        toast.error("Editor loading timed out");
      }
    }, 15000);
    
    return () => {
      clearTimeout(finalTimeout);
    };
  }, [isEditorInitializing]);

  const handleEditorReady = useCallback(() => {
    console.log("useEditorState: Editor ready callback triggered");
    setIsEditorLoaded(true);
    setIsEditorInitializing(false);
    setEditorError(null);
    toast.success("Editor loaded successfully!");
  }, []);

  const handleRetryEditor = useCallback(() => {
    console.log("useEditorState: Retrying editor initialization");
    setEditorError(null);
    setIsEditorInitializing(true);
    setIsEditorLoaded(false);
    setEditorKey(prev => prev + 1);
  }, []);

  const handleShowFallback = useCallback(() => {
    console.log("useEditorState: Showing fallback editor");
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
