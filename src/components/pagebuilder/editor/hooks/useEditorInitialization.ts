
import { useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import { toast } from 'sonner';
import { createEditorConfig } from '../utils/editorConfig';

interface UseEditorInitializationProps {
  editorId: string;
  organizationId: string;
  readOnly: boolean;
  initialData?: any;
  onChange?: (data: any) => void;
  onReady?: () => void;
  onError: (error: string) => void;
  onFallback: () => void;
  onSuccess: (editor: EditorJS) => void;
  debugId: string;
  clearTimeout: () => void;
}

export const useEditorInitialization = ({
  editorId,
  organizationId,
  readOnly,
  initialData,
  onChange,
  onReady,
  onError,
  onFallback,
  onSuccess,
  debugId,
  clearTimeout
}: UseEditorInitializationProps) => {
  
  const initializeEditor = async () => {
    console.log(`🚀 ${debugId}: Starting simplified editor initialization`);
    
    try {
      // Check if the holder element exists
      console.log(`🔍 ${debugId}: Looking for editor container: ${editorId}`);
      const holderElement = document.getElementById(editorId);
      if (!holderElement) {
        throw new Error(`Editor container '${editorId}' not found in DOM`);
      }
      console.log(`✅ ${debugId}: Found editor container element`);

      // Clear any existing content
      holderElement.innerHTML = '';
      console.log(`🧹 ${debugId}: Cleared existing container content`);

      // Create simplified editor configuration
      console.log(`⚙️ ${debugId}: Creating simplified editor configuration`);
      const editorConfig = createEditorConfig({
        editorId,
        initialData,
        readOnly,
        onChange
      });
      console.log(`⚙️ ${debugId}: Simplified editor config created`);

      console.log(`🎯 ${debugId}: Initializing Editor.js with minimal config...`);
      
      // Create new editor instance
      const editor = new EditorJS(editorConfig);

      // Wait for editor to be ready with timeout
      const readyPromise = Promise.race([
        editor.isReady,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Editor ready timeout')), 2000)
        )
      ]);

      await readyPromise;

      // Clear fallback timeout
      clearTimeout();

      // Store editor instance on the DOM element for onChange callback
      (holderElement as any).editorInstance = editor;
      console.log(`💾 ${debugId}: Stored editor instance on DOM element`);

      console.log(`🎉 ${debugId}: Editor is ready, updating states`);
      
      console.log(`📞 ${debugId}: Calling onReady callback`);
      onReady?.();
      
      console.log(`✅ ${debugId}: Editor initialization fully completed`);
      onSuccess(editor);

    } catch (err) {
      console.error(`❌ ${debugId}: Error during editor initialization:`, err);
      
      // Clear fallback timeout if it exists
      clearTimeout();
      
      // Switch to fallback mode instead of showing error
      console.log(`🔄 ${debugId}: Switching to fallback mode due to error`);
      onFallback();
      onError(`Editor failed to load: ${err instanceof Error ? err.message : "Unknown error"}`);
      
      // Still call onReady so the UI doesn't get stuck
      onReady?.();
      toast.error(`Using simple editor - advanced editor failed`);
    }
  };

  return { initializeEditor };
};
