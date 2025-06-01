
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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const enabledComponents = [
      'ServiceTimes',
      'ContactInfo', 
      'ChurchStats',
      'EventCalendar'
    ];
    
    const filteredConfig = createFilteredPuckConfig(enabledComponents);
    setConfig(filteredConfig);
    setIsReady(true);
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

  if (!isReady) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Initializing editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <style>
        {`
          /* Hide Puck's internal header by its specific class */
          ._PuckLayout-header_11o75_108 { display: none !important; }
          
          /* Ensure Puck takes full height and width */
          .puck-editor-container .Puck { 
            height: 100% !important; 
            width: 100% !important;
          }
          
          /* Fix any loading spinners that might be interfering */
          .puck-editor-container .loading { display: none !important; }
          
          /* Ensure the canvas is visible */
          .puck-editor-container .Puck > div {
            height: 100% !important;
          }
        `}
      </style>
      <div className="puck-editor-container h-full w-full">
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
