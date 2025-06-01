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
          
          /* Ensure sidebar toggle buttons are visible on mobile */
          .puck-mobile-editor .Puck-sidebarToggle {
            display: flex !important;
            position: fixed !important;
            z-index: 1001 !important;
            background: white !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
            padding: 10px !important;
            width: 44px !important;
            height: 44px !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
          }
          
          .puck-mobile-editor .Puck-sidebarToggle:hover {
            background: #f8fafc !important;
            border-color: #3b82f6 !important;
            transform: scale(1.05) !important;
          }
          
          /* Position left sidebar toggle */
          .puck-mobile-editor .Puck-sidebarToggle[aria-label*="left"] {
            top: 50% !important;
            left: 12px !important;
            transform: translateY(-50%) !important;
          }
          
          /* Position right sidebar toggle */
          .puck-mobile-editor .Puck-sidebarToggle[aria-label*="right"] {
            top: 50% !important;
            right: 12px !important;
            transform: translateY(-50%) !important;
          }
          
          /* Mobile sidebar styling */
          .puck-mobile-editor .Puck-sideBar {
            width: 90vw !important;
            max-width: 320px !important;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            position: fixed !important;
            top: 0;
            left: 0;
            height: 100vh;
            z-index: 1000;
            background: white;
            box-shadow: 2px 0 20px rgba(0, 0, 0, 0.15);
            border-radius: 0 12px 12px 0;
          }
          
          .puck-mobile-editor .Puck-sideBar--open {
            transform: translateX(0);
          }
          
          /* Mobile fields panel styling */
          .puck-mobile-editor .Puck-fields {
            width: 90vw !important;
            max-width: 320px !important;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            position: fixed !important;
            top: 0;
            right: 0;
            height: 100vh;
            z-index: 1000;
            background: white;
            box-shadow: -2px 0 20px rgba(0, 0, 0, 0.15);
            border-radius: 12px 0 0 12px;
          }
          
          .puck-mobile-editor .Puck-fields--open {
            transform: translateX(0);
          }
          
          /* Hide portal on mobile */
          .puck-mobile-editor .Puck-portal {
            display: none !important;
          }
          
          /* Improve scroll behavior */
          .puck-mobile-editor .Puck-sideBar,
          .puck-mobile-editor .Puck-fields {
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
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
