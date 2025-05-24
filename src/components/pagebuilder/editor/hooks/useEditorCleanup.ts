
import { useRef } from 'react';
import EditorJS from '@editorjs/editorjs';

interface UseEditorCleanupProps {
  editorRef: React.MutableRefObject<EditorJS | null>;
  debugId: string;
  onCleanup: () => void;
}

export const useEditorCleanup = ({
  editorRef,
  debugId,
  onCleanup
}: UseEditorCleanupProps) => {
  
  const cleanup = () => {
    console.log(`🧹 ${debugId}: Cleanup function called`);
    
    if (editorRef.current) {
      try {
        console.log(`🗑️ ${debugId}: Destroying editor instance`);
        editorRef.current.destroy();
        editorRef.current = null;
      } catch (err) {
        console.error(`❌ ${debugId}: Error destroying editor:`, err);
      }
    }
    onCleanup();
  };

  return { cleanup };
};
