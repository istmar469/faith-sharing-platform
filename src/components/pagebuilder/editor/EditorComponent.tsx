
import React from 'react';
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
      onReady?.();
      handleEditorReady();
    },
    editorId,
    readOnly,
    organizationId
  });

  // Show error state if there's an error
  if (error) {
    return <EditorErrorDisplay error={error} />;
  }

  // Render the editor container
  return (
    <div className="editor-wrapper">
      <div 
        id={editorId} 
        className="prose max-w-none min-h-[400px] p-6 bg-white rounded-lg border border-gray-200 focus-within:border-blue-500 transition-colors"
      />
    </div>
  );
};

export default EditorComponent;
