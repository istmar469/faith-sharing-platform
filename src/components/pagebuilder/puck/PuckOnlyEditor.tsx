
import React, { useEffect, useState } from 'react';
import { Puck } from '@measured/puck';
import { puckConfig, createFilteredPuckConfig } from './config/PuckConfig';
import '@measured/puck/puck.css';

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
  const [config, setConfig] = useState(puckConfig);

  useEffect(() => {
    // In the future, we can filter components based on organization tier
    // For now, enable all components for demo purposes
    const enabledComponents = [
      'ServiceTimes',
      'ContactInfo', 
      'ChurchStats',
      'EventCalendar'
    ];
    
    const filteredConfig = createFilteredPuckConfig(enabledComponents);
    setConfig(filteredConfig);
  }, [organizationId]);

  const handleChange = (data: any) => {
    console.log('PuckOnlyEditor: Data changed', data);
    onChange?.(data);
  };

  const handlePublish = (data: any) => {
    console.log('PuckOnlyEditor: Data published', data);
    onSave?.(data);
  };

  // Ensure we have valid data structure
  const safeInitialData = initialData && initialData.content ? initialData : {
    content: [],
    root: {}
  };

  return (
    <div className="puck-editor-container h-full">
      <Puck
        config={config}
        data={safeInitialData}
        onChange={handleChange}
        onPublish={handlePublish}
      />
    </div>
  );
};

export default PuckOnlyEditor;
