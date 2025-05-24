
import React, { useEffect } from 'react';
import { useEditorInstance } from './hooks/useEditorInstance';
import { usePageManagerContext } from '../context/PageManagerProvider';
import EditorErrorDisplay from './components/EditorErrorDisplay';

interface EditorComponentProps {
  initialData?: any;
  onChange?: (data: any) => void;
  onReady?: () => void;
  editorId?: string;
  readOnly?: boolean;
  organizationId: string;
}

const EditorComponent: React.FC<EditorComponentProps> = ({
  initialData,
  onChange,
  onReady,
  editorId = 'editorjs',
  readOnly = false,
  organizationId
}) => {
  const { handleEditorReady } = usePageManagerContext();
  const { error } = useEditorInstance({
    initialData,
    onChange,
    onReady: () => {
      // Call both the prop callback and the page manager
      onReady?.();
      handleEditorReady();
    },
    editorId,
    readOnly,
    organizationId
  });
  
  // Enhanced debug logging
  useEffect(() => {
    console.log("=== EditorComponent Debug Info ===");
    console.log("EditorComponent: Props and state", {
      editorId,
      readOnly,
      organizationId,
      hasInitialData: !!initialData,
      initialDataBlocksCount: initialData?.blocks?.length || 0,
      timestamp: new Date().toISOString()
    });
  }, [editorId, readOnly, organizationId, initialData]);
  
  // Show error state
  if (error) {
    return <EditorErrorDisplay error={error} />;
  }
  
  return (
    <div className="editor-wrapper">
      <div id={editorId} className="prose max-w-none min-h-[300px] p-4 bg-white rounded-md shadow-sm"/>
    </div>
  );
};

export default EditorComponent;
