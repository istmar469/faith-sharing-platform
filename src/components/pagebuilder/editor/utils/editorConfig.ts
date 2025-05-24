
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image';
import Quote from '@editorjs/quote';
import Checklist from '@editorjs/checklist';
import Delimiter from '@editorjs/delimiter';

interface CreateEditorConfigProps {
  editorId: string;
  initialData?: any;
  readOnly: boolean;
  onChange?: (data: any) => void;
}

export const createEditorConfig = ({
  editorId,
  initialData,
  readOnly,
  onChange
}: CreateEditorConfigProps) => {
  return {
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
      },
      image: {
        class: ImageTool,
        config: {
          endpoints: {
            byFile: '/api/upload-image', // You'll need to implement this endpoint
            byUrl: '/api/fetch-image',   // You'll need to implement this endpoint
          }
        }
      },
      quote: {
        class: Quote,
        inlineToolbar: true
      },
      checklist: {
        class: Checklist,
        inlineToolbar: true
      },
      delimiter: Delimiter
    },
    onChange: () => {
      if (onChange) {
        // Use setTimeout to avoid blocking the UI
        setTimeout(async () => {
          try {
            // Get editor instance from window if available
            const editorElement = document.getElementById(editorId);
            if (editorElement && (editorElement as any).editorInstance) {
              const data = await (editorElement as any).editorInstance.save();
              onChange(data);
            }
          } catch (error) {
            console.error("Error saving editor content:", error);
          }
        }, 100);
      }
    },
    placeholder: 'Click here to start writing...',
    logLevel: 'ERROR' as const
  };
};
