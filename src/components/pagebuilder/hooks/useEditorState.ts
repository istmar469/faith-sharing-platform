
import { useState, useCallback } from 'react';

interface UseEditorStateProps {
  organizationId: string | null;
  pageId: string | null;
}

export const useEditorState = ({ organizationId, pageId }: UseEditorStateProps) => {
  // Simple state management for editor readiness
  const [isEditorLoaded, setIsEditorLoaded] = useState(true);
  const [editorKey, setEditorKey] = useState(0);

  const handleEditorReady = useCallback(() => {
    console.log("useEditorState: Editor ready");
    setIsEditorLoaded(true);
  }, []);

  const handleForceRefresh = useCallback(() => {
    console.log("useEditorState: Force refresh editor");
    setEditorKey(prev => prev + 1);
  }, []);

  return {
    isEditorLoaded,
    editorKey,
    handleEditorReady,
    handleForceRefresh
  };
};
