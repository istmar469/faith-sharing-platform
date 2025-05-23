
import React, { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import List from '@editorjs/list';
import Image from '@editorjs/image';
import Embed from '@editorjs/embed';
import Quote from '@editorjs/quote';
import Checklist from '@editorjs/checklist';
import Delimiter from '@editorjs/delimiter';
import Raw from '@editorjs/raw';
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
  
  // Setup image upload function
  const uploadImageFile = async (file: File) => {
    try {
      if (!organizationId) {
        throw new Error('Organization ID is required for image uploads');
      }
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${organizationId}/${Date.now()}.${fileExt}`;
      
      // Check if the bucket exists, if not, this will fail and be caught
      const { data, error } = await supabase.storage
        .from('page-images')
        .upload(filePath, file);
      
      if (error) {
        throw error;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);
      
      return {
        success: 1,
        file: {
          url: publicUrl
        }
      };
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      return {
        success: 0,
        file: {
          url: null
        }
      };
    }
  };
  
  useEffect(() => {
    // Initialize Editor.js
    if (!editorRef.current) {
      // Use type assertion to bypass strict TypeScript checks
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
          },
          image: {
            class: Image,
            config: {
              uploader: {
                uploadByFile: uploadImageFile
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
          delimiter: Delimiter,
          embed: {
            class: Embed,
            config: {
              services: {
                youtube: true,
                vimeo: true
              }
            }
          },
          raw: Raw,
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
          setIsEditorReady(true);
          if (onReady) {
            onReady();
          }
        },
        placeholder: 'Click here to start writing or add a block...'
      };

      try {
        editorRef.current = new EditorJS(editorConfig);
      } catch (err) {
        console.error("Error initializing Editor.js:", err);
        toast.error("Could not initialize editor");
      }
    }
    
    // Cleanup function
    return () => {
      if (editorRef.current && isEditorReady) {
        try {
          editorRef.current.destroy();
          editorRef.current = null;
        } catch (err) {
          console.error("Error destroying editor:", err);
        }
      }
    };
  }, [editorId, initialData, isEditorReady, onChange, onReady, readOnly, uploadImageFile]);
  
  return (
    <div className="editor-wrapper">
      <div id={editorId} className="prose max-w-none min-h-[300px] p-4 bg-white rounded-md shadow-sm"/>
    </div>
  );
};

export default EditorComponent;
