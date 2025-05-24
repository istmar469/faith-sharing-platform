
import { useEffect, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';

interface UseEditorDataSyncProps {
  editorRef: React.MutableRefObject<EditorJS | null>;
  isEditorReady: boolean;
  initialData?: any;
  fallbackMode: boolean;
  debugId: string;
}

export const useEditorDataSync = ({
  editorRef,
  isEditorReady,
  initialData,
  fallbackMode,
  debugId
}: UseEditorDataSyncProps) => {
  
  // Handle data updates without recreating the editor
  useEffect(() => {
    if (editorRef.current && isEditorReady && initialData && !fallbackMode) {
      console.log(`📝 ${debugId}: Updating editor data`, {
        hasBlocks: initialData.blocks?.length > 0,
        blocksCount: initialData.blocks?.length || 0
      });
      
      try {
        editorRef.current.clear();
        if (initialData.blocks && initialData.blocks.length > 0) {
          editorRef.current.render(initialData);
          console.log(`✅ ${debugId}: Editor data updated successfully`);
        }
      } catch (err) {
        console.error(`❌ ${debugId}: Error updating editor data:`, err);
      }
    }
  }, [editorRef, isEditorReady, initialData, fallbackMode, debugId]);
};
