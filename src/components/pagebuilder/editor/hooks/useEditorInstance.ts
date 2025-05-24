
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
  const debugId = useRef(`EditorInstance-${Date.now()}`);

  useEffect(() => {
    console.log(`🎨 ${debugId.current}: useEditorInstance effect triggered`, {
      organizationId,
      editorId,
      readOnly,
      hasInitialData: !!initialData,
      hasOnChange: !!onChange,
      hasOnReady: !!onReady
    });

    if (!organizationId) {
      console.error(`❌ ${debugId.current}: No organization ID provided`);
      setError("Organization ID is required");
      return;
    }

    const initializeEditor = async () => {
      console.log(`🚀 ${debugId.current}: Starting editor initialization`);
      
      // Reset states
      setIsEditorReady(false);
      setError(null);

      try {
        // Check if the holder element exists
        console.log(`🔍 ${debugId.current}: Looking for editor container: ${editorId}`);
        const holderElement = document.getElementById(editorId);
        if (!holderElement) {
          throw new Error(`Editor container '${editorId}' not found in DOM`);
        }
        console.log(`✅ ${debugId.current}: Found editor container element`);

        // Clear any existing content
        holderElement.innerHTML = '';
        console.log(`🧹 ${debugId.current}: Cleared existing container content`);

        // Create editor configuration
        console.log(`⚙️ ${debugId.current}: Creating editor configuration`);
        const editorConfig = createEditorConfig({
          editorId,
          initialData,
          readOnly,
          onChange
        });
        console.log(`⚙️ ${debugId.current}: Editor config created:`, editorConfig);

        console.log(`🎯 ${debugId.current}: Initializing Editor.js...`);
        
        // Create new editor instance with timeout
        const editorPromise = new Promise((resolve, reject) => {
          const editor = new EditorJS(editorConfig);
          editorRef.current = editor;

          // Set a timeout for editor initialization
          const timeout = setTimeout(() => {
            console.error(`⏰ ${debugId.current}: Editor initialization timeout (15s)`);
            reject(new Error('Editor initialization timed out after 15 seconds'));
          }, 15000);

          // Wait for editor to be ready
          editor.isReady
            .then(() => {
              clearTimeout(timeout);
              console.log(`✅ ${debugId.current}: Editor.js initialization completed successfully`);
              resolve(editor);
            })
            .catch((err) => {
              clearTimeout(timeout);
              console.error(`❌ ${debugId.current}: Editor.js initialization failed:`, err);
              reject(err);
            });
        });

        const editor = await editorPromise;

        // Store editor instance on the DOM element for onChange callback
        (holderElement as any).editorInstance = editor;
        console.log(`💾 ${debugId.current}: Stored editor instance on DOM element`);

        console.log(`🎉 ${debugId.current}: Editor is ready, updating states`);
        setIsEditorReady(true);
        
        console.log(`📞 ${debugId.current}: Calling onReady callback`);
        onReady?.();
        
        toast.success("Editor loaded successfully!");
        console.log(`✅ ${debugId.current}: Editor initialization fully completed`);

      } catch (err) {
        console.error(`❌ ${debugId.current}: Error during editor initialization:`, err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to initialize editor: ${errorMessage}`);
        toast.error(`Editor failed to load: ${errorMessage}`);
      }
    };

    // Initialize with a small delay to ensure DOM is ready
    console.log(`⏰ ${debugId.current}: Scheduling editor initialization with 100ms delay`);
    const initTimeout = setTimeout(() => {
      console.log(`🚀 ${debugId.current}: Starting delayed editor initialization`);
      initializeEditor();
    }, 100);

    // Cleanup function
    return () => {
      console.log(`🧹 ${debugId.current}: Cleanup function called`);
      clearTimeout(initTimeout);
      if (editorRef.current) {
        try {
          console.log(`🗑️ ${debugId.current}: Destroying editor instance`);
          editorRef.current.destroy();
          editorRef.current = null;
        } catch (err) {
          console.error(`❌ ${debugId.current}: Error destroying editor:`, err);
        }
      }
      setIsEditorReady(false);
    };
  }, [editorId, organizationId, readOnly]); // Removed initialData from dependencies to prevent recreation

  // Handle data updates without recreating the editor
  useEffect(() => {
    if (editorRef.current && isEditorReady && initialData) {
      console.log(`📝 ${debugId.current}: Updating editor data`, {
        hasBlocks: initialData.blocks?.length > 0,
        blocksCount: initialData.blocks?.length || 0
      });
      
      try {
        editorRef.current.clear();
        if (initialData.blocks && initialData.blocks.length > 0) {
          editorRef.current.render(initialData);
          console.log(`✅ ${debugId.current}: Editor data updated successfully`);
        }
      } catch (err) {
        console.error(`❌ ${debugId.current}: Error updating editor data:`, err);
      }
    }
  }, [initialData, isEditorReady]);

  console.log(`📊 ${debugId.current}: Hook state:`, {
    isEditorReady,
    hasError: !!error,
    hasEditorRef: !!editorRef.current
  });

  return {
    editorRef,
    isEditorReady,
    error
  };
};
