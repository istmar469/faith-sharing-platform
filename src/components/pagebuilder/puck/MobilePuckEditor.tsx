
import React, { useEffect, useState } from 'react';
import { Puck } from '@measured/puck';
import { puckConfig, createFilteredPuckConfig } from './config/PuckConfig';
import '@measured/puck/puck.css';

interface MobilePuckEditorProps {
  initialData?: any;
  onChange?: (data: any) => void;
  onSave?: (data: any) => void;
  organizationId: string;
  mode?: 'edit' | 'preview';
}

const MobilePuckEditor: React.FC<MobilePuckEditorProps> = ({
  initialData,
  onChange,
  onSave,
  organizationId,
  mode = 'edit'
}) => {
  const [config, setConfig] = useState(puckConfig);

  useEffect(() => {
    // Enable all components for mobile demo
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
    console.log('MobilePuckEditor: Data changed', data);
    onChange?.(data);
  };

  const handlePublish = (data: any) => {
    console.log('MobilePuckEditor: Data published', data);
    onSave?.(data);
  };

  // Ensure we have valid data structure
  const safeInitialData = initialData && initialData.content ? initialData : {
    content: [],
    root: {}
  };

  return (
    <div className="puck-mobile-editor h-full">
      <style>
        {`
          .puck-mobile-editor .Puck {
            height: 100%;
          }
          .puck-mobile-editor .Puck-portal {
            height: 100vh;
          }
          .puck-mobile-editor .Puck-sidebarInner {
            max-height: 50vh;
            overflow-y: auto;
          }
        `}
      </style>
      <Puck
        config={config}
        data={safeInitialData}
        onChange={handleChange}
        onPublish={handlePublish}
      />
    </div>
  );
};

export default MobilePuckEditor;
