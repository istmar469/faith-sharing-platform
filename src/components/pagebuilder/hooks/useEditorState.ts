
import { useState, useCallback } from 'react';

interface UseEditorStateProps {
  organizationId: string | null;
  pageId: string | null;
}

export const useEditorState = ({ organizationId, pageId }: UseEditorStateProps) => {
  // Simplified state - the editor component handles its own loading states now
  const [isEditorLoaded, setIsEditorLoaded] = useState(true);
  const [isEditorInitializing, setIsEditorInitializing] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [showFallback, setShowFallback] = useState(false);

  const handleEditorReady = useCallback(() => {
    console.log("useEditorState: Editor ready");
    setIsEditorLoaded(true);
    setIsEditorInitializing(false);
    setEditorError(null);
    setShowFallback(false);
  }, []);

  const handleRetryEditor = useCallback(() => {
    console.log("useEditorState: Retrying editor");
    setEditorKey(prev => prev + 1);
  }, []);

  const handleShowFallback = useCallback(() => {
    console.log("useEditorState: Showing fallback");
    setShowFallback(true);
    setIsEditorInitializing(false);
    setEditorError(null);
    setIsEditorLoaded(true);
  }, []);

  const handleForceRefresh = useCallback(() => {
    console.log("useEditorState: Force refresh");
    setEditorKey(prev => prev + 1);
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
