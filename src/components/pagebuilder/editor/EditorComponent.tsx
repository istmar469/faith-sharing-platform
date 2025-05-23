
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
  const [error, setError] = useState<string | null>(null);
  
  // Stable references to prevent recreation
  const onChangeRef = useRef(onChange);
  const onReadyRef = useRef(onReady);
  
  // Update refs when props change
  useEffect(() => {
    onChangeRef.current = onChange;
    onReadyRef.current = onReady;
  }, [onChange, onReady]);
  
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
      timestamp: new Date().toISOString()
    });
  }, [editorId, readOnly, organizationId, initialData, isEditorReady]);
  
  // Initialize editor - stable dependencies only
  useEffect(() => {
    if (!organizationId) {
      console.error("EditorComponent: No organization ID provided");
      setError("Organization ID is required");
      return;
    }

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
    
    // Reset states
    setIsEditorReady(false);
    setError(null);
    
    // Add small delay to ensure DOM is ready
    const initTimeout = setTimeout(async () => {
      try {
        console.log("EditorComponent: Creating new editor instance");
        
        // Ensure the holder element exists
        const holderElement = document.getElementById(editorId);
        if (!holderElement) {
          console.error("EditorComponent: Holder element not found:", editorId);
          setError("Editor container not found");
          return;
        }
        
        // Clear any existing content in the holder
        holderElement.innerHTML = '';
        
        // Create new editor instance with stable configuration
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

        console.log("EditorComponent: Creating EditorJS with config", editorConfig);
        const editor = new EditorJS(editorConfig);
        editorRef.current = editor;
        
        // Wait for editor to be ready using the built-in promise
        await editor.isReady;
        console.log("EditorComponent: Editor is ready");
        
        setIsEditorReady(true);
        if (onReadyRef.current) {
          onReadyRef.current();
        }
        toast.success("Editor initialized successfully!");
        
      } catch (err) {
        console.error("EditorComponent: Error initializing Editor.js:", err);
        setError("Could not initialize editor: " + (err instanceof Error ? err.message : "Unknown error"));
        toast.error("Editor failed to load");
      }
    }, 100);
    
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
  }, [editorId, readOnly, organizationId]); // Stable dependencies only
  
  // Update editor data when initialData changes - but don't recreate editor
  useEffect(() => {
    if (editorRef.current && isEditorReady && initialData) {
      console.log("EditorComponent: Updating editor data");
      // Use clear and render instead of the non-existent render method
      editorRef.current.clear();
      // Re-initialize with new data by destroying and recreating
      setTimeout(() => {
        if (editorRef.current) {
          try {
            editorRef.current.destroy();
            editorRef.current = null;
            setIsEditorReady(false);
          } catch (err) {
            console.error("EditorComponent: Error clearing editor for data update:", err);
          }
        }
      }, 0);
    }
  }, [initialData]);
  
  // Show error state
  if (error) {
    return (
      <div className="editor-wrapper">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">Editor Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="editor-wrapper">
      <div id={editorId} className="prose max-w-none min-h-[300px] p-4 bg-white rounded-md shadow-sm"/>
    </div>
  );
};

export default EditorComponent;
