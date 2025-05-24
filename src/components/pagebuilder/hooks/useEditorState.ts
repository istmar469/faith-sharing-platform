
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
        pageId,
        timestamp: new Date().toISOString()
      });
      setIsEditorInitializing(true);
      setEditorError(null);
      setEditorKey(prev => prev + 1);
      setShowFallback(false);
      setIsEditorLoaded(false);
    }
  }, [organizationId, pageId]);

  // Reduced timeout for faster fallback (5 seconds instead of 15)
  useEffect(() => {
    if (!isEditorInitializing) {
      console.log(`⏹️ ${debugId.current}: Editor not initializing, skipping timeout setup`);
      return;
    }

    console.log(`⏰ ${debugId.current}: Setting up editor initialization timeout (5 seconds with auto-fallback)`);
    
    // Reduced timeout for faster fallback
    const fallbackTimeout = setTimeout(() => {
      if (isEditorInitializing) {
        console.error(`⏰ ${debugId.current}: Editor initialization timeout after 5 seconds - switching to fallback`);
        setIsEditorInitializing(false);
        setShowFallback(true);
        setEditorError("Editor took too long to load - using simple editor");
        setIsEditorLoaded(true); // Mark as loaded so UI doesn't get stuck
        toast.error("Using simple editor - advanced editor timed out");
      }
    }, 5000); // Reduced from 15000 to 5000
    
    return () => {
      console.log(`🧹 ${debugId.current}: Clearing editor timeout`);
      clearTimeout(fallbackTimeout);
    };
  }, [isEditorInitializing]);

  const handleEditorReady = useCallback(() => {
    console.log(`✅ ${debugId.current}: handleEditorReady callback triggered`);
    setIsEditorLoaded(true);
    setIsEditorInitializing(false);
    setEditorError(null);
    setShowFallback(false);
    toast.success("Editor loaded successfully!");
    console.log(`🎉 ${debugId.current}: Editor ready state updated successfully`);
  }, []);

  const handleRetryEditor = useCallback(() => {
    console.log(`🔄 ${debugId.current}: Retrying editor initialization`);
    setEditorError(null);
    setIsEditorInitializing(true);
    setIsEditorLoaded(false);
    setShowFallback(false);
    setEditorKey(prev => prev + 1);
  }, []);

  const handleShowFallback = useCallback(() => {
    console.log(`🔄 ${debugId.current}: Switching to fallback editor`);
    setShowFallback(true);
    setIsEditorInitializing(false);
    setEditorError(null);
    setIsEditorLoaded(true); // Consider fallback as "loaded"
    toast.info("Using simple editor mode");
  }, []);

  const handleForceRefresh = useCallback(() => {
    console.log(`🔄 ${debugId.current}: Force refreshing editor`);
    setEditorError(null);
    setIsEditorInitializing(true);
    setIsEditorLoaded(false);
    setShowFallback(false);
    setEditorKey(prev => prev + 1);
    
    // Clear any cached Editor.js data
    setTimeout(() => {
      const editorElement = document.getElementById('editorjs');
      if (editorElement) {
        editorElement.innerHTML = '';
      }
    }, 100);
  }, []);

  return {
    isEditorLoaded,
    isEditorInitializing,
    editorError,
    editorKey,
    showFallback,
    handleEditorReady,
    handleRetryEditor,
    handleShowFallback,
    handleForceRefresh
  };
};
