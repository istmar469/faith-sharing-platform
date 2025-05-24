
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useSimpleEditor } from './hooks/useSimpleEditor';
import { usePageManagerContext } from '../context/PageManagerProvider';
import { createEditorConfig } from './utils/editorConfig';
import { Loader2, AlertTriangle, Palette, Type, List, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  const [isEnhancedMode, setIsEnhancedMode] = useState(true);
  
  console.log(`🎨 ${debugId.current}: EditorComponent initializing with organizationId: ${organizationId}`);
  
  const handleUseSimpleEditor = useCallback(() => {
    console.log(`📝 ${debugId.current}: Forcing simple editor mode`);
    setForceSimpleEditor(true);
    setIsEnhancedMode(false);
    onReady?.();
    handleEditorReady();
  }, [onReady, handleEditorReady]);

  const handleUseEnhancedEditor = useCallback(() => {
    console.log(`🚀 ${debugId.current}: Switching to enhanced editor mode`);
    setForceSimpleEditor(false);
    setIsEnhancedMode(true);
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
      handleEditorReady();
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
      <div className="editor-wrapper">
        <div className="h-64 flex items-center justify-center text-gray-400 flex-col">
          <Loader2 className="h-8 w-8 mb-3 animate-spin text-blue-500" />
          <p className="text-sm font-medium mb-2">Loading Enhanced Editor...</p>
          <p className="text-xs text-gray-500 mb-4">Setting up advanced editing tools</p>
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

  // Error state with enhanced editor fallback
  if (error && !shouldShowSimpleEditor) {
    return (
      <div className="editor-wrapper">
        <div className="h-64 flex items-center justify-center text-amber-600 flex-col">
          <AlertTriangle className="h-8 w-8 mb-3" />
          <p className="text-sm font-medium mb-1">Editor Loading Issue</p>
          <p className="text-xs mb-4 text-center max-w-sm">{error}</p>
          <div className="flex gap-2">
            <Button 
              variant="secondary"
              size="sm"
              onClick={handleUseSimpleEditor}
            >
              Use Simple Editor
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
        <div 
          id={editorId} 
          className="prose max-w-none min-h-[400px] p-6 bg-white rounded-lg border border-gray-200"
        />
      </div>
    );
  }

  // Enhanced simple editor with toolbar preview
  if (shouldShowSimpleEditor) {
    console.log(`📝 ${debugId.current}: Rendering enhanced simple editor`);
    
    return (
      <div className="editor-wrapper">
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800 font-medium">
                Simple Editor Mode
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Basic editing with automatic formatting. Enhanced visual editor coming soon!
              </p>
            </div>
            {!forceSimpleEditor && (
              <Button 
                variant="outline"
                size="sm"
                onClick={handleUseEnhancedEditor}
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                Try Enhanced Editor
              </Button>
            )}
          </div>
        </div>

        {/* Toolbar Preview */}
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">Available in enhanced mode:</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs"><Type className="h-3 w-3 mr-1" />Headers</Badge>
            <Badge variant="secondary" className="text-xs"><List className="h-3 w-3 mr-1" />Lists</Badge>
            <Badge variant="secondary" className="text-xs"><Quote className="h-3 w-3 mr-1" />Quotes</Badge>
            <Badge variant="secondary" className="text-xs"><Palette className="h-3 w-3 mr-1" />Styling</Badge>
          </div>
        </div>
        
        <div className="relative">
          <div 
            id={editorId} 
            className="prose max-w-none min-h-[400px] p-6 bg-white rounded-lg border border-gray-200 focus-within:border-blue-500 transition-colors shadow-sm"
            contentEditable
            suppressContentEditableWarning
            style={{ outline: 'none' }}
            onInput={(e) => {
              const target = e.target as HTMLElement;
              if (onChange) {
                onChange({
                  time: Date.now(),
                  blocks: [{
                    type: 'paragraph',
                    data: { text: target.textContent || '' }
                  }],
                  version: '2.30.8'
                });
              }
            }}
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

        <div className="mt-3 text-xs text-gray-500">
          <p>💡 <strong>Tip:</strong> Type naturally - basic formatting like <strong>**bold**</strong> and <em>*italic*</em> will be applied automatically</p>
        </div>
      </div>
    );
  }

  // Enhanced visual editor
  console.log(`🎨 ${debugId.current}: Rendering enhanced visual editor`);
  
  return (
    <div className="editor-wrapper">
      {isReady && (
        <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-800 font-medium">
                Enhanced Visual Editor Active
              </p>
              <p className="text-xs text-green-600 mt-1">
                Full editing tools available. Press <kbd className="px-1 py-0.5 bg-green-100 rounded text-xs">/</kbd> to see all blocks
              </p>
            </div>
            <Badge variant="outline" className="text-green-700 border-green-300">
              Pro Mode
            </Badge>
          </div>
        </div>
      )}
      
      <div 
        id={editorId} 
        className="prose prose-lg max-w-none min-h-[400px] p-6 bg-white rounded-lg border border-gray-200 focus-within:border-blue-500 transition-colors shadow-sm"
        style={{ minHeight: '500px' }}
      />
      
      {isReady && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600 font-medium mb-2">Keyboard Shortcuts:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500">
            <div><kbd className="px-1 py-0.5 bg-gray-200 rounded">Cmd+H</kbd> Header</div>
            <div><kbd className="px-1 py-0.5 bg-gray-200 rounded">Cmd+L</kbd> List</div>
            <div><kbd className="px-1 py-0.5 bg-gray-200 rounded">Cmd+Q</kbd> Quote</div>
            <div><kbd className="px-1 py-0.5 bg-gray-200 rounded">Tab</kbd> Toolbar</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorComponent;
