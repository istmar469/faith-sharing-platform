
import React, { useRef, useState, useCallback } from 'react';
import { useSimpleEditor } from './hooks/useSimpleEditor';
import EditorLoadingState from './components/EditorLoadingState';
import EditorErrorState from './components/EditorErrorState';
import EnhancedEditorStatus from './components/EnhancedEditorStatus';
import SimpleEditorStatus from './components/SimpleEditorStatus';
import SimpleEditorInput from './components/SimpleEditorInput';
import SimpleEditorTip from './components/SimpleEditorTip';
import KeyboardShortcuts from './components/KeyboardShortcuts';

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
  const debugId = useRef(`EditorComponent-${Date.now()}`);
  const [forceSimpleEditor, setForceSimpleEditor] = useState(false);
  const [isEnhancedMode, setIsEnhancedMode] = useState(true);
  
  console.log(`🎨 ${debugId.current}: EditorComponent initializing with organizationId: ${organizationId}`);
  
  const handleUseSimpleEditor = useCallback(() => {
    console.log(`📝 ${debugId.current}: Forcing simple editor mode`);
    setForceSimpleEditor(true);
    setIsEnhancedMode(false);
    onReady?.();
  }, [onReady]);

  const handleUseEnhancedEditor = useCallback(() => {
    console.log(`🚀 ${debugId.current}: Switching to enhanced editor mode`);
    setForceSimpleEditor(false);
    setIsEnhancedMode(true);
  }, []);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);
  
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
    },
    editorId,
    readOnly,
    organizationId,
    forceSimple: forceSimpleEditor
  });

  const shouldShowSimpleEditor = showSimpleEditor || forceSimpleEditor;

  // Loading state with enhanced editor option
  if (!isReady && !error && !shouldShowSimpleEditor) {
    return (
      <>
        <EditorLoadingState onUseSimpleEditor={handleUseSimpleEditor} />
        <div 
          id={editorId} 
          className="prose max-w-none min-h-[400px] p-6 bg-white rounded-lg border border-gray-200"
        />
      </>
    );
  }

  // Error state with enhanced editor fallback
  if (error && !shouldShowSimpleEditor) {
    return (
      <>
        <EditorErrorState 
          error={error}
          onUseSimpleEditor={handleUseSimpleEditor}
          onRetry={handleRetry}
        />
        <div 
          id={editorId} 
          className="prose max-w-none min-h-[400px] p-6 bg-white rounded-lg border border-gray-200"
        />
      </>
    );
  }

  // Enhanced simple editor with toolbar preview
  if (shouldShowSimpleEditor) {
    console.log(`📝 ${debugId.current}: Rendering enhanced simple editor`);
    
    return (
      <div className="editor-wrapper">
        <SimpleEditorStatus 
          forceSimpleEditor={forceSimpleEditor}
          onUseEnhancedEditor={handleUseEnhancedEditor}
        />
        
        <SimpleEditorInput 
          editorId={editorId}
          onChange={onChange}
        />

        <SimpleEditorTip />
      </div>
    );
  }

  // Enhanced visual editor
  console.log(`🎨 ${debugId.current}: Rendering enhanced visual editor`);
  
  return (
    <div className="editor-wrapper">
      {isReady && <EnhancedEditorStatus />}
      
      <div 
        id={editorId} 
        className="prose prose-lg max-w-none min-h-[400px] p-6 bg-white rounded-lg border border-gray-200 focus-within:border-blue-500 transition-colors shadow-sm"
        style={{ minHeight: '500px' }}
      />
      
      {isReady && <KeyboardShortcuts />}
    </div>
  );
};

export default EditorComponent;
