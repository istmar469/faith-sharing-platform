
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Eye, Loader2 } from 'lucide-react';

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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (useSimpleEditor) return;

    let timeoutId: NodeJS.Timeout;

    const initializeEditor = async () => {
      try {
        if (!containerRef.current) return;

        console.log('Loading Enhanced Editor.js...');
        
        // Set a timeout for Editor.js initialization
        timeoutId = setTimeout(() => {
          console.log('Editor.js timeout, falling back to simple editor');
          setUseSimpleEditor(true);
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
          onChange: () => {
            // Auto-save after 2 seconds of inactivity
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(() => {
              handleSave();
            }, 2000);
          },
          onReady: () => {
            clearTimeout(timeoutId);
            console.log('Enhanced Editor.js ready!');
            setIsReady(true);
          }
        });

        let autoSaveTimeout: NodeJS.Timeout;

      } catch (error) {
        console.error('Failed to initialize Enhanced Editor.js:', error);
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
    setSaving(true);
    try {
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
        await onSave(data);
      } else if (editorRef.current && isReady) {
        const outputData = await editorRef.current.save();
        await onSave(outputData);
      }
    } catch (error) {
      console.error('Error saving editor data:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    // Open preview in new window
    window.open('/preview', '_blank');
  };

  const handleSimpleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
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
        
        <div className="flex gap-2 mb-4">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handlePreview}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <span className="text-sm font-medium">Content Editor</span>
          </div>
          <textarea
            value={content}
            onChange={handleSimpleEditorChange}
            placeholder="Start writing your content here..."
            className="w-full h-96 p-4 border-0 focus:outline-none resize-none font-mono text-sm"
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
                <strong>Loading Enhanced Editor...</strong><br />
                Setting up the visual editor with advanced tools.
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
      
      {isReady && (
        <div className="flex gap-2 mb-4">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handlePreview}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </div>
      )}
      
      <div 
        ref={containerRef}
        className="min-h-96 p-6 bg-white rounded-lg border border-gray-200 focus-within:border-blue-500 transition-colors shadow-sm"
        style={{ minHeight: '500px' }}
      />
      
      {isReady && (
        <div className="text-xs text-gray-500 mt-2">
          <p>💡 <strong>Tips:</strong> Use <kbd>Tab</kbd> to access the toolbar, <kbd>/</kbd> to insert blocks, and the editor auto-saves every 2 seconds.</p>
        </div>
      )}
    </div>
  );
};

export default MinimalEditor;
