import React, { useEffect } from 'react';
import { Puck, Data } from '@measured/puck';
import { puckConfig } from './config/PuckConfig';
import '@measured/puck/puck.css';
import './styles/puck-overrides.css';

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
  console.log('PuckOnlyEditor: Rendering', {
    hasInitialData: !!initialData,
    organizationId,
    mode,
    contentLength: initialData?.content?.length || 0
  });

  const handleChange = (data: Data) => {
    console.log('PuckOnlyEditor: Data changed', {
      contentCount: data?.content?.length || 0,
      hasRoot: !!data?.root
    });
    onChange?.(data);
  };

  const handlePublish = (data: Data) => {
    console.log('PuckOnlyEditor: Publishing data', data);
    onSave?.(data);
  };

  // Ensure we have valid data structure that matches Puck's Data type
  const editorData: Data = initialData || { 
    content: [], 
    root: { 
      props: {} 
    } 
  } as Data;

  useEffect(() => {
    console.log('PuckOnlyEditor: Mounted with data', editorData);
  }, []);

  return (
    <div className="puck-editor-wrapper h-full">
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
    </div>
  );
};

export default PuckOnlyEditor;
