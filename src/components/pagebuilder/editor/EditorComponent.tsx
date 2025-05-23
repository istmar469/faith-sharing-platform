
import React, { useEffect, useRef, useState, useCallback } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import List from '@editorjs/list';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const editorRef = useRef<EditorJS | null>(null);
  const [isEditorReady, setIsEditorReady] = useState<boolean>(false);
  const [editorKey, setEditorKey] = useState<number>(0);
  
  // Initialize editor with simplified configuration
  useEffect(() => {
    console.log("EditorComponent: Initializing simplified editor");
    
    // Cleanup existing editor
    if (editorRef.current) {
      try {
        editorRef.current.destroy();
        editorRef.current = null;
      } catch (err) {
        console.error("Error destroying existing editor:", err);
      }
    }
    
    // Create new editor instance with minimal tools
    const editorConfig: any = {
      holder: editorId,
      data: initialData || { blocks: [] },
      readOnly,
      tools: {
        header: {
          class: Header,
          config: {
            levels: [1, 2, 3, 4, 5, 6],
            defaultLevel: 2
          }
        },
        paragraph: {
          class: Paragraph,
          inlineToolbar: true
        },
        list: {
          class: List,
          inlineToolbar: true
        }
      },
      onChange: async () => {
        if (isEditorReady && onChange && editorRef.current) {
          try {
            const data = await editorRef.current.save();
            onChange(data);
          } catch (error) {
            console.error("Error saving editor content:", error);
          }
        }
      },
      onReady: () => {
        console.log("EditorComponent: Basic editor is ready");
        setIsEditorReady(true);
        if (onReady) {
          onReady();
        }
      },
      placeholder: 'Click here to start writing...',
      logLevel: 'ERROR'
    };

    try {
      editorRef.current = new EditorJS(editorConfig);
    } catch (err) {
      console.error("Error initializing simplified Editor.js:", err);
      toast.error("Could not initialize editor");
    }
    
    // Cleanup function
    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.destroy();
          editorRef.current = null;
        } catch (err) {
          console.error("Error destroying editor:", err);
        }
      }
      setIsEditorReady(false);
    };
  }, [editorId, readOnly, onReady, editorKey, initialData, onChange]);
  
  return (
    <div className="editor-wrapper">
      <div id={editorId} className="prose max-w-none min-h-[300px] p-4 bg-white rounded-md shadow-sm"/>
    </div>
  );
};

export default EditorComponent;
