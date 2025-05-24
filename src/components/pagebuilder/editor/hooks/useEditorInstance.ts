
import { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import { useEditorTimeout } from './useEditorTimeout';
import { useEditorInitialization } from './useEditorInitialization';
import { useEditorDataSync } from './useEditorDataSync';
import { useEditorCleanup } from './useEditorCleanup';

interface UseEditorInstanceProps {
  initialData?: any;
  onChange?: (data: any) => void;
  onReady?: () => void;
  editorId: string;
  readOnly: boolean;
  organizationId: string;
}

export const useEditorInstance = ({
  initialData,
  onChange,
  onReady,
  editorId,
  readOnly,
  organizationId
}: UseEditorInstanceProps) => {
  const editorRef = useRef<EditorJS | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState(false);
  const debugId = useRef(`EditorInstance-${Date.now()}`);

  const handleFallback = () => {
    setFallbackMode(true);
    setError("Editor.js failed to initialize quickly. Using simple editor.");
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleSuccess = (editor: EditorJS) => {
    editorRef.current = editor;
    setIsEditorReady(true);
  };

  const handleCleanup = () => {
    setIsEditorReady(false);
  };

  const { clearTimeout } = useEditorTimeout({
    isEditorReady,
    onFallback: handleFallback,
    onReady,
    debugId: debugId.current
  });

  const { initializeEditor } = useEditorInitialization({
    editorId,
    organizationId,
    readOnly,
    initialData,
    onChange,
    onReady,
    onError: handleError,
    onFallback: handleFallback,
    onSuccess: handleSuccess,
    debugId: debugId.current,
    clearTimeout
  });

  const { cleanup } = useEditorCleanup({
    editorRef,
    debugId: debugId.current,
    onCleanup: handleCleanup
  });

  useEditorDataSync({
    editorRef,
    isEditorReady,
    initialData,
    fallbackMode,
    debugId: debugId.current
  });

  useEffect(() => {
    console.log(`🎨 ${debugId.current}: useEditorInstance effect triggered`, {
      organizationId,
      editorId,
      readOnly,
      hasInitialData: !!initialData,
      hasOnChange: !!onChange,
      hasOnReady: !!onReady,
      timestamp: new Date().toISOString()
    });

    if (!organizationId) {
      console.error(`❌ ${debugId.current}: No organization ID provided - switching to fallback`);
      setFallbackMode(true);
      setError("Organization ID is required");
      onReady?.(); // Still call onReady to prevent UI from getting stuck
      return;
    }

    // Reset states
    setIsEditorReady(false);
    setError(null);
    setFallbackMode(false);

    // Initialize with a small delay to ensure DOM is ready
    console.log(`⏰ ${debugId.current}: Scheduling editor initialization with 50ms delay`);
    const initTimeout = setTimeout(() => {
      console.log(`🚀 ${debugId.current}: Starting delayed editor initialization`);
      initializeEditor();
    }, 50);

    // Cleanup function
    return () => {
      clearTimeout();
      cleanup();
    };
  }, [editorId, organizationId, readOnly]); // Removed initialData from dependencies to prevent recreation

  console.log(`📊 ${debugId.current}: Hook state:`, {
    isEditorReady,
    hasError: !!error,
    fallbackMode,
    hasEditorRef: !!editorRef.current
  });

  return {
    editorRef,
    isEditorReady,
    error,
    fallbackMode
  };
};
