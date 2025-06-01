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

  // Disable Puck's internal publish button
  const handlePublish = (data: any) => {
    console.log('PuckOnlyEditor: Publish disabled - using external controls');
    // Don't call onSave here - let the parent handle publishing
  };

  const safeInitialData = initialData && initialData.content ? initialData : {
    content: [],
    root: {}
  };

  return (
    <div className="h-full w-full">
      <style>
        {`
          /* Hide Puck's internal header by its specific class */
          ._PuckLayout-header_11o75_108 { display: none !important; }
          
          /* Ensure Puck takes full height */
          .puck-editor-container .Puck { height: 100% !important; }
        `}
      </style>
      <div className="puck-editor-container h-full">
        <Puck
          config={config}
          data={safeInitialData}
          onChange={handleChange}
          onPublish={handlePublish}
        />
      </div>
    </div>
  );
};

export default PuckOnlyEditor;
