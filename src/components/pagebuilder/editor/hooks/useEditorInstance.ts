
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
  const [fallbackMode, setFallbackMode] = useState(false);
  const debugId = useRef(`EditorInstance-${Date.now()}`);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    const initializeEditor = async () => {
      console.log(`🚀 ${debugId.current}: Starting simplified editor initialization`);
      
      // Reset states
      setIsEditorReady(false);
      setError(null);
      setFallbackMode(false);

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

        // Create simplified editor configuration
        console.log(`⚙️ ${debugId.current}: Creating simplified editor configuration`);
        const editorConfig = createEditorConfig({
          editorId,
          initialData,
          readOnly,
          onChange
        });
        console.log(`⚙️ ${debugId.current}: Simplified editor config created`);

        console.log(`🎯 ${debugId.current}: Initializing Editor.js with minimal config...`);
        
        // Set reduced fallback timeout (3 seconds)
        initTimeoutRef.current = setTimeout(() => {
          console.error(`⏰ ${debugId.current}: Editor initialization timeout - switching to fallback mode`);
          setFallbackMode(true);
          setError("Editor.js failed to initialize quickly. Using simple editor.");
          onReady?.(); // Call onReady to prevent UI from getting stuck
          toast.error("Using simple editor - advanced editor failed to load");
        }, 3000); // Reduced to 3 seconds

        // Create new editor instance
        const editor = new EditorJS(editorConfig);
        editorRef.current = editor;

        // Wait for editor to be ready with timeout
        const readyPromise = Promise.race([
          editor.isReady,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Editor ready timeout')), 2000)
          )
        ]);

        await readyPromise;

        // Clear fallback timeout
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
          initTimeoutRef.current = null;
        }

        // Store editor instance on the DOM element for onChange callback
        (holderElement as any).editorInstance = editor;
        console.log(`💾 ${debugId.current}: Stored editor instance on DOM element`);

        console.log(`🎉 ${debugId.current}: Editor is ready, updating states`);
        setIsEditorReady(true);
        
        console.log(`📞 ${debugId.current}: Calling onReady callback`);
        onReady?.();
        
        console.log(`✅ ${debugId.current}: Editor initialization fully completed`);

      } catch (err) {
        console.error(`❌ ${debugId.current}: Error during editor initialization:`, err);
        
        // Clear fallback timeout if it exists
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
          initTimeoutRef.current = null;
        }
        
        // Switch to fallback mode instead of showing error
        console.log(`🔄 ${debugId.current}: Switching to fallback mode due to error`);
        setFallbackMode(true);
        setError(`Editor failed to load: ${err instanceof Error ? err.message : "Unknown error"}`);
        
        // Still call onReady so the UI doesn't get stuck
        onReady?.();
        toast.error(`Using simple editor - advanced editor failed`);
      }
    };

    // Initialize with a small delay to ensure DOM is ready
    console.log(`⏰ ${debugId.current}: Scheduling editor initialization with 50ms delay`);
    const initTimeout = setTimeout(() => {
      console.log(`🚀 ${debugId.current}: Starting delayed editor initialization`);
      initializeEditor();
    }, 50); // Reduced delay

    // Cleanup function
    return () => {
      console.log(`🧹 ${debugId.current}: Cleanup function called`);
      clearTimeout(initTimeout);
      
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
      
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
    if (editorRef.current && isEditorReady && initialData && !fallbackMode) {
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
  }, [initialData, isEditorReady, fallbackMode]);

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
