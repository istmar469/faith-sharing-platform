
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
  const [initializationAttempts, setInitializationAttempts] = useState(0);
  
  // Enhanced debug logging
  useEffect(() => {
    console.log("=== EditorComponent Debug Info ===");
    console.log("EditorComponent: Props and state", {
      editorId,
      readOnly,
      organizationId,
      hasInitialData: !!initialData,
      initialDataBlocksCount: initialData?.blocks?.length || 0,
      isEditorReady,
      editorKey,
      initializationAttempts,
      timestamp: new Date().toISOString()
    });
  }, [editorId, readOnly, organizationId, initialData, isEditorReady, editorKey, initializationAttempts]);
  
  // Initialize editor with enhanced error handling
  useEffect(() => {
    console.log("EditorComponent: Starting initialization process");
    
    // Cleanup existing editor
    if (editorRef.current) {
      try {
        console.log("EditorComponent: Destroying existing editor");
        editorRef.current.destroy();
        editorRef.current = null;
      } catch (err) {
        console.error("EditorComponent: Error destroying existing editor:", err);
      }
    }
    
    // Increment attempts counter
    setInitializationAttempts(prev => prev + 1);
    console.log("EditorComponent: Initialization attempt", initializationAttempts + 1);
    
    // Add small delay to ensure DOM is ready
    const initTimeout = setTimeout(() => {
      try {
        console.log("EditorComponent: Creating new editor instance");
        
        // Ensure the holder element exists
        const holderElement = document.getElementById(editorId);
        if (!holderElement) {
          console.error("EditorComponent: Holder element not found:", editorId);
          toast.error("Editor container not found");
          return;
        }
        
        // Clear any existing content in the holder
        holderElement.innerHTML = '';
        
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
                console.log("EditorComponent: Saving editor content");
                const data = await editorRef.current.save();
                onChange(data);
              } catch (error) {
                console.error("EditorComponent: Error saving editor content:", error);
              }
            }
          },
          onReady: () => {
            console.log("EditorComponent: Editor ready callback triggered");
            setIsEditorReady(true);
            if (onReady) {
              onReady();
            }
            toast.success("Editor initialized successfully!");
          },
          placeholder: 'Click here to start writing...',
          logLevel: 'ERROR' as const
        };

        console.log("EditorComponent: Creating EditorJS with config", editorConfig);
        editorRef.current = new EditorJS(editorConfig);
        
      } catch (err) {
        console.error("EditorComponent: Error initializing Editor.js:", err);
        toast.error("Could not initialize editor: " + (err instanceof Error ? err.message : "Unknown error"));
        
        // If we've tried multiple times, give up
        if (initializationAttempts >= 3) {
          console.error("EditorComponent: Max initialization attempts reached");
          toast.error("Editor failed to load after multiple attempts. Please refresh the page.");
        }
      }
    }, 100); // Small delay to ensure DOM readiness
    
    // Cleanup function
    return () => {
      clearTimeout(initTimeout);
      if (editorRef.current) {
        try {
          console.log("EditorComponent: Cleanup - destroying editor");
          editorRef.current.destroy();
          editorRef.current = null;
        } catch (err) {
          console.error("EditorComponent: Error during cleanup:", err);
        }
      }
      setIsEditorReady(false);
    };
  }, [editorId, readOnly, onReady, editorKey, organizationId]); // Removed initialData and onChange from deps to prevent recreating editor
  
  // Update editor data when initialData changes (but don't recreate editor)
  useEffect(() => {
    if (editorRef.current && isEditorReady && initialData) {
      console.log("EditorComponent: Updating editor data");
      editorRef.current.render(initialData).catch(err => {
        console.error("EditorComponent: Error updating editor data:", err);
      });
    }
  }, [initialData, isEditorReady]);
  
  return (
    <div className="editor-wrapper">
      <div id={editorId} className="prose max-w-none min-h-[300px] p-4 bg-white rounded-md shadow-sm"/>
    </div>
  );
};

export default EditorComponent;
