
import React, { useRef, useEffect } from 'react';

interface EnhancedEditorProps {
  initialData?: any;
  onChange?: () => void;
  onReady: () => void;
  onError: (error: string) => void;
  editorRef: React.MutableRefObject<any>;
}

const EnhancedEditor: React.FC<EnhancedEditorProps> = ({
  initialData,
  onChange,
  onReady,
  onError,
  editorRef
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const initializeEditor = async () => {
      try {
        if (!containerRef.current) return;

        console.log('Loading Enhanced Editor.js...');
        
        timeoutId = setTimeout(() => {
          console.log('Editor.js timeout, falling back to simple editor');
          onError('Editor.js loading timeout');
        }, 8000);

        const EditorJS = (await import('@editorjs/editorjs')).default;
        const Header = (await import('@editorjs/header')).default;
        const List = (await import('@editorjs/list')).default;
        const Paragraph = (await import('@editorjs/paragraph')).default;
        const Quote = (await import('@editorjs/quote')).default;
        const Delimiter = (await import('@editorjs/delimiter')).default;
        const Checklist = (await import('@editorjs/checklist')).default;

        editorRef.current = new EditorJS({
          holder: containerRef.current,
          data: initialData || {
            blocks: [
              {
                type: 'header',
                data: {
                  text: 'Welcome to Your Website',
                  level: 1
                }
              },
              {
                type: 'paragraph',
                data: {
                  text: 'Start writing your content here. Use the toolbar to add headers, lists, quotes, and more!'
                }
              }
            ]
          },
          tools: {
            header: {
              class: Header,
              config: {
                levels: [1, 2, 3, 4],
                defaultLevel: 2,
                placeholder: 'Enter a header'
              }
            },
            paragraph: {
              class: Paragraph,
              inlineToolbar: true,
              config: {
                placeholder: 'Tell your story...'
              }
            },
            list: {
              class: List,
              inlineToolbar: true,
              config: {
                defaultStyle: 'unordered'
              }
            },
            quote: {
              class: Quote,
              inlineToolbar: true,
              config: {
                quotePlaceholder: 'Enter a quote',
                captionPlaceholder: 'Quote\'s author'
              }
            },
            delimiter: Delimiter,
            checklist: {
              class: Checklist,
              inlineToolbar: true
            }
          },
          placeholder: 'Click here to start writing your content...',
          autofocus: true,
          onChange: onChange,
          onReady: () => {
            clearTimeout(timeoutId);
            console.log('Enhanced Editor.js ready!');
            onReady();
          }
        });

      } catch (error) {
        console.error('Failed to initialize Enhanced Editor.js:', error);
        clearTimeout(timeoutId);
        onError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    initializeEditor();

    return () => {
      clearTimeout(timeoutId);
      if (editorRef.current && typeof editorRef.current.destroy === 'function') {
        editorRef.current.destroy();
      }
    };
  }, [initialData, onChange, onReady, onError, editorRef]);

  return (
    <div 
      ref={containerRef}
      className="min-h-96 p-6 bg-white rounded-lg border border-gray-200 focus-within:border-blue-500 transition-colors shadow-sm"
      style={{ minHeight: '500px' }}
    />
  );
};

export default EnhancedEditor;
