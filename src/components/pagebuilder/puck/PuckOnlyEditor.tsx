
import React, { useEffect } from 'react';
import { Puck } from '@measured/puck';
import { puckConfig } from './config/PuckConfig';
import '@measured/puck/puck.css';
import './styles/puck-overrides.css';

interface PuckOnlyEditorProps {
  initialData?: any;
  onChange?: (data: any) => void;
  onSave?: (data: any) => void;
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

  const handleChange = (data: any) => {
    console.log('PuckOnlyEditor: Data changed', {
      contentCount: data?.content?.length || 0,
      hasRoot: !!data?.root
    });
    onChange?.(data);
  };

  const handlePublish = (data: any) => {
    console.log('PuckOnlyEditor: Publishing data', data);
    onSave?.(data);
  };

  // Ensure we have valid data structure
  const editorData = initialData || { 
    content: [], 
    root: { 
      props: { 
        title: '' 
      } 
    } 
  };

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
