
import { useState, useEffect, useRef } from 'react';

interface UseSimpleEditorProps {
  initialData?: any;
  onChange?: (data: any) => void;
  onReady?: () => void;
  editorId?: string;
  readOnly?: boolean;
  organizationId: string;
  forceSimple?: boolean;
}

export const useSimpleEditor = ({
  initialData,
  onChange,
  onReady,
  editorId = 'editorjs',
  readOnly = false,
  organizationId,
  forceSimple = false
}: UseSimpleEditorProps) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSimpleEditor, setShowSimpleEditor] = useState(forceSimple);
  const isInitialized = useRef(false);
  const editorInstanceRef = useRef<any>(null);
  const debugId = useRef(`useSimpleEditor-${Date.now()}`);

  console.log(`🔧 ${debugId.current}: useSimpleEditor hook initializing`, {
    organizationId,
    editorId,
    forceSimple,
    isInitialized: isInitialized.current
  });

  // Force simple editor if requested
  useEffect(() => {
    if (forceSimple && !showSimpleEditor) {
      console.log(`📝 ${debugId.current}: Forcing simple editor mode`);
      setShowSimpleEditor(true);
      setIsReady(true);
      onReady?.();
    }
  }, [forceSimple, showSimpleEditor, onReady]);

  // Initialize Editor.js if not forcing simple mode
  useEffect(() => {
    if (forceSimple || showSimpleEditor || isInitialized.current) {
      return;
    }

    console.log(`🚀 ${debugId.current}: Starting Editor.js initialization`);
    
    const initializeEditor = async () => {
      try {
        // Check if container exists
        const container = document.getElementById(editorId);
        if (!container) {
          console.warn(`⚠️ ${debugId.current}: Editor container not found, retrying...`);
          // Retry after a short delay
          setTimeout(() => {
            if (!isInitialized.current) {
              initializeEditor();
            }
          }, 100);
          return;
        }

        console.log(`📦 ${debugId.current}: Loading Editor.js dynamically`);
        
        // Try to load Editor.js with timeout
        const editorPromise = import('@editorjs/editorjs').then(async (EditorJS) => {
          console.log(`🎯 ${debugId.current}: Editor.js loaded, creating instance`);
          
          // Import tools
          const [Header, List, Paragraph] = await Promise.all([
            import('@editorjs/header'),
            import('@editorjs/list'),
            import('@editorjs/paragraph')
          ]);

          const editor = new EditorJS.default({
            holder: editorId,
            data: initialData || { blocks: [] },
            readOnly,
            tools: {
              header: Header.default,
              list: List.default,
              paragraph: {
                class: Paragraph.default,
                inlineToolbar: true,
              },
            },
            onChange: () => {
              if (onChange && editorInstanceRef.current) {
                editorInstanceRef.current.save().then((outputData: any) => {
                  onChange(outputData);
                }).catch((error: any) => {
                  console.error(`❌ ${debugId.current}: Error saving editor data:`, error);
                });
              }
            },
            onReady: () => {
              console.log(`✅ ${debugId.current}: Editor.js ready!`);
              setIsReady(true);
              onReady?.();
            }
          });

          editorInstanceRef.current = editor;
          isInitialized.current = true;
          
          return editor;
        });

        // Set timeout for Editor.js initialization
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Editor.js initialization timeout'));
          }, 5000); // 5 second timeout
        });

        await Promise.race([editorPromise, timeoutPromise]);

      } catch (error) {
        console.error(`❌ ${debugId.current}: Editor.js initialization failed:`, error);
        setError(error instanceof Error ? error.message : 'Editor initialization failed');
        
        // Fallback to simple editor after a delay
        setTimeout(() => {
          console.log(`📝 ${debugId.current}: Falling back to simple editor`);
          setShowSimpleEditor(true);
          setIsReady(true);
          onReady?.();
        }, 1000);
      }
    };

    // Start initialization with a small delay to ensure DOM is ready
    const initTimeout = setTimeout(initializeEditor, 50);

    return () => {
      clearTimeout(initTimeout);
      if (editorInstanceRef.current && typeof editorInstanceRef.current.destroy === 'function') {
        editorInstanceRef.current.destroy();
        editorInstanceRef.current = null;
      }
    };
  }, [initialData, onChange, onReady, editorId, readOnly, forceSimple, showSimpleEditor]);

  return {
    isReady,
    error,
    showSimpleEditor
  };
};
