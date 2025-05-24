
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import List from '@editorjs/list';

interface CreateEditorConfigProps {
  editorId: string;
  initialData?: any;
  readOnly: boolean;
  isEditorReady: boolean;
  onChangeRef: React.MutableRefObject<((data: any) => void) | undefined>;
  editorRef: React.MutableRefObject<any>;
}

export const createEditorConfig = ({
  editorId,
  initialData,
  readOnly,
  isEditorReady,
  onChangeRef,
  editorRef
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
      }
    },
    onChange: () => {
      // Synchronous callback - avoid async operations here
      if (isEditorReady && onChangeRef.current && editorRef.current) {
        console.log("EditorComponent: Editor content changed");
        // Defer the save operation to avoid blocking
        setTimeout(async () => {
          try {
            const data = await editorRef.current!.save();
            onChangeRef.current!(data);
          } catch (error) {
            console.error("EditorComponent: Error saving editor content:", error);
          }
        }, 0);
      }
    },
    placeholder: 'Click here to start writing...',
    logLevel: 'ERROR' as const
  };
};
