
import { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import { createEditorConfig } from '../utils/editorConfig';
import { toast } from 'sonner';

interface UseSimpleEditorProps {
  initialData?: any;
  onChange?: (data: any) => void;
  onReady?: () => void;
  editorId: string;
  readOnly: boolean;
  organizationId: string;
}

export const useSimpleEditor = ({
  initialData,
  onChange,
  onReady,
  editorId,
  readOnly,
  organizationId
}: UseSimpleEditorProps) => {
  const editorRef = useRef<EditorJS | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSimpleEditor, setShowSimpleEditor] = useState(false);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = () => {
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = null;
    }
    
    if (editorRef.current) {
      try {
        editorRef.current.destroy();
        editorRef.current = null;
      } catch (err) {
        console.error('Error destroying editor:', err);
      }
    }
  };

  const initializeEditor = async () => {
    console.log('🚀 Initializing Editor.js');
    
    try {
      // Check if container exists
      const container = document.getElementById(editorId);
      if (!container) {
        throw new Error(`Container ${editorId} not found`);
      }

      // Clear container
      container.innerHTML = '';

      // Create editor config
      const config = createEditorConfig({
        editorId,
        initialData,
        readOnly,
        onChange
      });

      // Initialize editor
      const editor = new EditorJS(config);
      
      // Wait for editor to be ready with timeout
      await Promise.race([
        editor.isReady,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Editor timeout')), 5000)
        )
      ]);

      editorRef.current = editor;
      setIsReady(true);
      setError(null);
      
      // Clear timeout since we succeeded
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }

      console.log('✅ Editor.js ready');
      onReady?.();

    } catch (err) {
      console.warn('⚠️ Editor.js failed, switching to simple editor:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setShowSimpleEditor(true);
      setIsReady(true);
      onReady?.();
    }
  };

  const handleUseSimpleEditor = () => {
    cleanup();
    setShowSimpleEditor(true);
    setIsReady(true);
    setError(null);
    onReady?.();
    toast.info('Using simple text editor');
  };

  useEffect(() => {
    if (!organizationId) {
      console.log('No organization ID - using simple editor');
      setShowSimpleEditor(true);
      setIsReady(true);
      onReady?.();
      return;
    }

    // Reset states
    setIsReady(false);
    setError(null);
    setShowSimpleEditor(false);

    // Set timeout for fallback to simple editor
    initTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Editor timeout - switching to simple editor');
      setShowSimpleEditor(true);
      setIsReady(true);
      onReady?.();
    }, 5000);

    // Small delay to ensure DOM is ready
    const initTimeout = setTimeout(() => {
      initializeEditor();
    }, 100);

    return () => {
      clearTimeout(initTimeout);
      cleanup();
    };
  }, [editorId, organizationId, readOnly]);

  return {
    editorRef,
    isReady,
    error,
    showSimpleEditor,
    handleUseSimpleEditor
  };
};
