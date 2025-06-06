
import React, { useEffect } from 'react';
import { Puck, Data } from '@measured/puck';
import { puckConfig } from './config/PuckConfig';
// import { createPuckOverrides } from './config/PuckOverrides'; // Removed - using default Puck behavior
import { useTenantContext } from '@/components/context/TenantContext';
import PuckErrorBoundary from './PuckErrorBoundary';
import '@measured/puck/puck.css';
// import './styles/puck-overrides.css'; // Removed - using default Puck styling
// Removed collision detection patch - using default Puck behavior

interface PuckOnlyEditorProps {
  initialData?: Data;
  onChange?: (data: Data) => void;
  onSave?: (data: Data) => void;
  organizationId: string;
  mode?: 'edit' | 'preview';
}

const PuckOnlyEditor: React.FC<PuckOnlyEditorProps> = ({
  initialData,
  onChange,
  onSave,
  organizationId,
  mode = 'edit'
}) => {
  const { organizationName, subdomain } = useTenantContext();
  
  console.log('PuckOnlyEditor: Rendering', {
    hasInitialData: !!initialData,
    organizationId,
    organizationName,
    subdomain,
    mode,
    contentLength: initialData?.content?.length || 0
  });

  const handleChange = (data: Data) => {
    console.log('PuckOnlyEditor: Data changed', {
      contentCount: data?.content?.length || 0,
      hasRoot: !!data?.root
    });
    
    // Validate and sanitize data before passing to onChange
    try {
      const safeData: Data = {
        content: Array.isArray(data?.content) ? data.content.filter(item => item && item.type) : [],
        root: data?.root || { props: {} },
        ...(data?.zones && { zones: data.zones })
      };
      onChange?.(safeData);
    } catch (error) {
      console.error('PuckOnlyEditor: Error processing data change:', error);
      // Pass original data if sanitization fails
      onChange?.(data);
    }
  };

  const handlePublish = (data: Data) => {
    console.log('PuckOnlyEditor: Publishing data via Puck interface', data);
    onSave?.(data);
  };

  // Ensure we have valid data structure that matches Puck's Data type
  // Add deep validation to prevent undefined values that cause collision detection crashes
  const editorData: Data = {
    content: Array.isArray(initialData?.content) ? initialData.content.map(item => ({
      type: item?.type || 'Hero', // Fallback type to prevent undefined
      props: item?.props || {}, // Ensure props object exists
      ...(item?.readOnly !== undefined && { readOnly: item.readOnly })
    })) : [],
    root: {
      props: initialData?.root?.props || {},
      ...(initialData?.root?.readOnly !== undefined && { readOnly: initialData.root.readOnly })
    },
    ...(initialData?.zones && { zones: initialData.zones })
  } as Data;

  // Removed overrides - using default Puck behavior for simplicity

  useEffect(() => {
    console.log('PuckOnlyEditor: Mounted with data', editorData);
  }, []);

  // Add a mounted state to ensure DOM is ready before rendering Puck
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    // Delay Puck rendering to avoid collision detection timing issues
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div>Loading editor...</div>
      </div>
    );
  }
  console.log("PuckOnlyEditor: editorData", JSON.stringify(editorData, null, 2)); 
  return (
    <div className="h-full w-full">
      <PuckErrorBoundary fallbackMessage="The page editor crashed during drag operations. This is often caused by component configuration issues.">
        <Puck
          config={puckConfig}
          data={editorData}
          onChange={handleChange}
          onPublish={handlePublish}
          permissions={{
            drag: true,
            edit: true,
            insert: true,
            delete: true,
          }}
        />
      </PuckErrorBoundary>
    </div>
  );
};

export default PuckOnlyEditor;
