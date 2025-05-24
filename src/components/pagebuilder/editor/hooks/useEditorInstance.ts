
import { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import { toast } from 'sonner';
import { createEditorConfig } from '../utils/editorConfig';

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

  useEffect(() => {
    if (!organizationId) {
      setError("Organization ID is required");
      return;
    }

    const initializeEditor = async () => {
      // Reset states
      setIsEditorReady(false);
      setError(null);

      try {
        // Ensure the holder element exists
        const holderElement = document.getElementById(editorId);
        if (!holderElement) {
          throw new Error(`Editor container '${editorId}' not found`);
        }

        // Clear any existing content
        holderElement.innerHTML = '';

        // Create editor configuration
        const editorConfig = createEditorConfig({
          editorId,
          initialData,
          readOnly,
          onChange
        });

        console.log("Initializing Editor.js with config:", editorConfig);
        
        // Create new editor instance
        const editor = new EditorJS(editorConfig);
        editorRef.current = editor;

        // Store editor instance on the DOM element for onChange callback
        (holderElement as any).editorInstance = editor;

        // Wait for editor to be ready
        await editor.isReady;
        console.log("Editor.js is ready");

        setIsEditorReady(true);
        onReady?.();
        toast.success("Editor loaded successfully!");

      } catch (err) {
        console.error("Error initializing Editor.js:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to initialize editor: ${errorMessage}`);
        toast.error("Editor failed to load");
      }
    };

    // Initialize with a small delay to ensure DOM is ready
    const initTimeout = setTimeout(initializeEditor, 100);

    // Cleanup function
    return () => {
      clearTimeout(initTimeout);
      if (editorRef.current) {
        try {
          editorRef.current.destroy();
          editorRef.current = null;
        } catch (err) {
          console.error("Error destroying editor:", err);
        }
      }
      setIsEditorReady(false);
    };
  }, [editorId, organizationId, readOnly]); // Removed initialData from dependencies to prevent recreation

  // Handle data updates without recreating the editor
  useEffect(() => {
    if (editorRef.current && isEditorReady && initialData) {
      console.log("Updating editor data");
      // Use the render method to update data without destroying
      editorRef.current.clear();
      if (initialData.blocks && initialData.blocks.length > 0) {
        editorRef.current.render(initialData);
      }
    }
  }, [initialData, isEditorReady]);

  return {
    editorRef,
    isEditorReady,
    error
  };
};
