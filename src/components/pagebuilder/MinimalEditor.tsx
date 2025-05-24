
import React, { useRef, useState } from 'react';
import EditorToolbar from './editor/EditorToolbar';
import SimpleEditor from './editor/SimpleEditor';
import EnhancedEditor from './editor/EnhancedEditor';
import EditorStatusBar from './editor/EditorStatusBar';

interface MinimalEditorProps {
  initialData?: any;
  onSave: (data: any) => void;
}

const MinimalEditor: React.FC<MinimalEditorProps> = ({ initialData, onSave }) => {
  const editorRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [useSimpleEditor, setUseSimpleEditor] = useState(false);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  let autoSaveTimeout: NodeJS.Timeout;

  const handleSave = async () => {
    setSaving(true);
    try {
      if (useSimpleEditor) {
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
    window.open('/preview', '_blank');
  };

  const handleEditorChange = () => {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
      handleSave();
    }, 2000);
  };

  const handleSimpleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleEditorReady = () => {
    setIsReady(true);
  };

  const handleEditorError = (error: string) => {
    console.error('Editor error:', error);
    setUseSimpleEditor(true);
  };

  const handleUseSimpleEditor = () => {
    setUseSimpleEditor(true);
  };

  return (
    <div className="space-y-4">
      <EditorStatusBar
        isReady={isReady}
        useSimpleEditor={useSimpleEditor}
        onUseSimpleEditor={handleUseSimpleEditor}
      />
      
      {(isReady || useSimpleEditor) && (
        <EditorToolbar
          saving={saving}
          onSave={handleSave}
          onPreview={handlePreview}
        />
      )}
      
      {useSimpleEditor ? (
        <SimpleEditor
          content={content}
          onChange={handleSimpleEditorChange}
        />
      ) : (
        <EnhancedEditor
          initialData={initialData}
          onChange={handleEditorChange}
          onReady={handleEditorReady}
          onError={handleEditorError}
          editorRef={editorRef}
        />
      )}
      
      {isReady && !useSimpleEditor && (
        <EditorStatusBar
          isReady={isReady}
          useSimpleEditor={useSimpleEditor}
          onUseSimpleEditor={handleUseSimpleEditor}
        />
      )}
    </div>
  );
};

export default MinimalEditor;
