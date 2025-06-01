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
          /* Keep Puck header visible but hide only the publish button */
          .Puck-header-publishButton { display: none !important; }
          
          /* Ensure sidebar toggle buttons are visible and accessible */
          .Puck-sidebarToggle {
            display: flex !important;
            z-index: 100 !important;
            background: white !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 6px !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
            padding: 8px !important;
            margin: 4px !important;
            width: 32px !important;
            height: 32px !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
          }
          
          .Puck-sidebarToggle:hover {
            background: #f8fafc !important;
            border-color: #3b82f6 !important;
            transform: scale(1.05) !important;
          }
          
          /* Ensure sidebars have proper width and positioning */
          .Puck-sideBar {
            width: 280px !important;
            background: white !important;
            border-right: 1px solid #e5e7eb !important;
          }
          
          .Puck-fields {
            width: 280px !important;
            background: white !important;
            border-left: 1px solid #e5e7eb !important;
          }
          
          /* Make sure the canvas area adjusts properly */
          .Puck-frame {
            transition: margin 0.3s ease !important;
          }
          
          /* Improve visibility of component selection */
          .Puck-componentWrapper--selected {
            outline: 2px solid #3b82f6 !important;
            outline-offset: 2px !important;
          }
          
          /* Ensure proper mobile responsive behavior */
          @media (max-width: 768px) {
            .Puck-sideBar {
              transform: translateX(-100%);
              transition: transform 0.3s ease;
              position: fixed !important;
              z-index: 1000 !important;
              height: 100vh !important;
            }
            
            .Puck-sideBar--open {
              transform: translateX(0);
            }
            
            .Puck-fields {
              transform: translateX(100%);
              transition: transform 0.3s ease;
              position: fixed !important;
              right: 0 !important;
              z-index: 1000 !important;
              height: 100vh !important;
            }
            
            .Puck-fields--open {
              transform: translateX(0);
            }
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

export default PuckOnlyEditor;
