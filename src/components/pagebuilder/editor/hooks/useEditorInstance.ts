
import { useEffect, useRef, useState, useCallback } from 'react';
import EditorJS from '@editorjs/editorjs';
import { toast } from 'sonner';
import { createEditorConfig } from '../utils/editorConfig';

interface UseEditorInstanceProps {
  initialData?: any;
  onChange?: (data: any) => void;
  onReady?: () => void;
  editorId: string;
  readOnly: boolean;
  organizationId: string;
}

export const useEditorInstance = ({
  initialData,
  onChange,
  onReady,
  editorId,
  readOnly,
  organizationId
}: UseEditorInstanceProps) => {
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

  const createEditor = useCallback(async () => {
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
      
      // Create editor configuration
      const editorConfig = createEditorConfig({
        editorId,
        initialData,
        readOnly,
        isEditorReady,
        onChangeRef,
        editorRef
      });

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
  }, [editorId, readOnly, organizationId, initialData, isEditorReady]);

  // Initialize editor - stable dependencies only
  useEffect(() => {
    // Add small delay to ensure DOM is ready
    const initTimeout = setTimeout(() => {
      createEditor();
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
  }, [createEditor]);
  
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
  }, [initialData, isEditorReady]);

  return {
    editorRef,
    isEditorReady,
    error
  };
};
