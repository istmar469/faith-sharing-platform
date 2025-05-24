
import React, { useRef, useEffect, useState } from 'react';

interface MinimalEditorProps {
  initialData?: any;
  onSave: (data: any) => void;
}

const MinimalEditor: React.FC<MinimalEditorProps> = ({ initialData, onSave }) => {
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [useSimpleEditor, setUseSimpleEditor] = useState(false);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (useSimpleEditor) return;

    let timeoutId: NodeJS.Timeout;

    const initializeEditor = async () => {
      try {
        if (!containerRef.current) return;

        console.log('Loading Editor.js...');
        
        // Set a timeout for Editor.js initialization
        timeoutId = setTimeout(() => {
          console.log('Editor.js timeout, falling back to simple editor');
          setUseSimpleEditor(true);
        }, 5000);

        const EditorJS = (await import('@editorjs/editorjs')).default;
        const Header = (await import('@editorjs/header')).default;
        const List = (await import('@editorjs/list')).default;
        const Paragraph = (await import('@editorjs/paragraph')).default;

        editorRef.current = new EditorJS({
          holder: containerRef.current,
          data: initialData || {
            blocks: [
              {
                type: 'paragraph',
                data: {
                  text: 'Start writing your content here...'
                }
              }
            ]
          },
          tools: {
            header: Header,
            list: List,
            paragraph: {
              class: Paragraph,
              inlineToolbar: true,
            },
          },
          onChange: () => {
            handleSave();
          },
          onReady: () => {
            clearTimeout(timeoutId);
            console.log('Editor.js ready!');
            setIsReady(true);
          }
        });

      } catch (error) {
        console.error('Failed to initialize Editor.js:', error);
        clearTimeout(timeoutId);
        setUseSimpleEditor(true);
      }
    };

    initializeEditor();

    return () => {
      clearTimeout(timeoutId);
      if (editorRef.current && typeof editorRef.current.destroy === 'function') {
        editorRef.current.destroy();
      }
    };
  }, [initialData, useSimpleEditor]);

  const handleSave = async () => {
    if (useSimpleEditor) {
      // Save simple editor content
      const data = {
        time: Date.now(),
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: content
            }
          }
        ],
        version: '2.30.8'
      };
      onSave(data);
    } else if (editorRef.current && isReady) {
      try {
        const outputData = await editorRef.current.save();
        onSave(outputData);
      } catch (error) {
        console.error('Error saving editor data:', error);
      }
    }
  };

  const handleSimpleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSimpleEditorSave = () => {
    handleSave();
  };

  if (useSimpleEditor) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Simple Editor Mode</strong><br />
            Using a basic text editor. The visual editor will be available in a future update.
          </p>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Content Editor</span>
              <button
                onClick={handleSimpleEditorSave}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
          <textarea
            value={content}
            onChange={handleSimpleEditorChange}
            placeholder="Start writing your content here..."
            className="w-full h-96 p-4 border-0 focus:outline-none resize-none"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isReady && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-800">
                <strong>Loading Editor...</strong><br />
                Setting up the visual editor interface.
              </p>
            </div>
            <button
              onClick={() => setUseSimpleEditor(true)}
              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
            >
              Use Simple Editor
            </button>
          </div>
        </div>
      )}
      
      <div 
        ref={containerRef}
        className="min-h-96 p-6 bg-white rounded-lg border border-gray-200 focus-within:border-blue-500 transition-colors"
      />
    </div>
  );
};

export default MinimalEditor;
