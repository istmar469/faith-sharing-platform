
import React, { useRef } from 'react';
import { useEditorInstance } from './hooks/useEditorInstance';
import { usePageManagerContext } from '../context/PageManagerProvider';
import EditorErrorDisplay from './components/EditorErrorDisplay';
import FallbackEditor from '../components/FallbackEditor';

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
  const debugId = useRef(`EditorComponent-${Date.now()}`);
  
  console.log(`🎨 ${debugId.current}: EditorComponent rendered`, {
    organizationId,
    editorId,
    readOnly,
    hasInitialData: !!initialData,
    hasOnChange: !!onChange,
    hasOnReady: !!onReady,
    timestamp: new Date().toISOString()
  });
  
  const { error, fallbackMode } = useEditorInstance({
    initialData,
    onChange,
    onReady: () => {
      console.log(`📞 ${debugId.current}: useEditorInstance onReady callback triggered`);
      
      console.log(`📞 ${debugId.current}: Calling local onReady callback`);
      onReady?.();
      
      console.log(`📞 ${debugId.current}: Calling PageManager handleEditorReady`);
      handleEditorReady();
      
      console.log(`✅ ${debugId.current}: All onReady callbacks completed`);
    },
    editorId,
    readOnly,
    organizationId
  });

  // Show fallback editor if in fallback mode
  if (fallbackMode) {
    console.log(`🔄 ${debugId.current}: Rendering fallback editor`);
    return (
      <div className="editor-wrapper">
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-sm text-amber-800">
            Using simplified editor mode. The advanced editor failed to load.
          </p>
        </div>
        <FallbackEditor
          pageElements={initialData}
          onChange={onChange || (() => {})}
        />
      </div>
    );
  }

  // Show error state if there's an error and not in fallback mode
  if (error && !fallbackMode) {
    console.error(`❌ ${debugId.current}: Showing error state:`, error);
    return <EditorErrorDisplay error={error} />;
  }

  console.log(`🎯 ${debugId.current}: Rendering editor container`);

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
