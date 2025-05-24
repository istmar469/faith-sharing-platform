
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import List from '@editorjs/list';

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
  console.log(`🔧 Creating minimal editor config for ${editorId}`);
  
  return {
    holder: editorId,
    data: initialData || { blocks: [] },
    readOnly,
    // Minimal tools for better reliability
    tools: {
      header: {
        class: Header,
        config: {
          levels: [1, 2, 3],
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
    logLevel: 'ERROR' as const,
    // Reduce initialization time
    minHeight: 200
  };
};
