
import React, { useRef, useState, useCallback } from 'react';
import { useSimpleEditor } from './hooks/useSimpleEditor';
import { usePageManagerContext } from '../context/PageManagerProvider';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [forceSimpleEditor, setForceSimpleEditor] = useState(false);
  
  console.log(`🎨 ${debugId.current}: EditorComponent initializing with organizationId: ${organizationId}`);
  
  const handleUseSimpleEditor = useCallback(() => {
    console.log(`📝 ${debugId.current}: Forcing simple editor mode`);
    setForceSimpleEditor(true);
    // Still call the ready callbacks
    onReady?.();
    handleEditorReady();
  }, [onReady, handleEditorReady]);
  
  const { 
    isReady, 
    error, 
    showSimpleEditor 
  } = useSimpleEditor({
    initialData,
    onChange,
    onReady: () => {
      console.log(`✅ ${debugId.current}: Editor ready callback`);
      onReady?.();
      handleEditorReady();
    },
    editorId,
    readOnly,
    organizationId,
    forceSimple: forceSimpleEditor
  });

  // Force simple editor if explicitly requested
  const shouldShowSimpleEditor = showSimpleEditor || forceSimpleEditor;

  // Loading state with quick fallback option
  if (!isReady && !error && !shouldShowSimpleEditor) {
    return (
      <div className="editor-wrapper">
        <div className="h-64 flex items-center justify-center text-gray-400 flex-col">
          <Loader2 className="h-8 w-8 mb-2 animate-spin" />
          <p className="text-sm font-medium mb-4">Loading Editor...</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleUseSimpleEditor}
          >
            Use Simple Editor Instead
          </Button>
        </div>
        <div 
          id={editorId} 
          className="prose max-w-none min-h-[400px] p-6 bg-white rounded-lg border border-gray-200"
        />
      </div>
    );
  }

  // Error state with simple editor fallback
  if (error && !shouldShowSimpleEditor) {
    return (
      <div className="editor-wrapper">
        <div className="h-64 flex items-center justify-center text-amber-600 flex-col">
          <AlertTriangle className="h-8 w-8 mb-2" />
          <p className="text-sm font-medium mb-1">Editor Loading Issue</p>
          <p className="text-xs mb-4">{error}</p>
          <Button 
            variant="secondary"
            size="sm"
            onClick={handleUseSimpleEditor}
          >
            Use Simple Editor
          </Button>
        </div>
        <div 
          id={editorId} 
          className="prose max-w-none min-h-[400px] p-6 bg-white rounded-lg border border-gray-200"
        />
      </div>
    );
  }

  // Simple editor fallback
  if (shouldShowSimpleEditor) {
    console.log(`📝 ${debugId.current}: Rendering simple editor`);
    
    return (
      <div className="editor-wrapper">
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Simple Editor Mode</strong><br />
            You can start typing to create content. The advanced editor will be available soon.
          </p>
        </div>
        <div className="relative">
          <div 
            id={editorId} 
            className="prose max-w-none min-h-[400px] p-6 bg-white rounded-lg border border-gray-200 focus-within:border-blue-500 transition-colors"
            contentEditable
            suppressContentEditableWarning
            style={{ outline: 'none' }}
          />
          <div 
            className="absolute top-6 left-6 text-gray-400 pointer-events-none select-none"
            style={{ 
              display: 'block'
            }}
          >
            Start typing your content here...
          </div>
        </div>
      </div>
    );
  }

  // Normal editor
  console.log(`🎨 ${debugId.current}: Rendering normal editor`);
  
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
