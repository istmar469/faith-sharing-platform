
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
  const [isReady, setIsReady] = useState(false);
  const [editorData, setEditorData] = useState(null);

  useEffect(() => {
    try {
      const enabledComponents = [
        'ServiceTimes',
        'ContactInfo', 
        'ChurchStats',
        'EventCalendar'
      ];
      
      const filteredConfig = createFilteredPuckConfig(enabledComponents);
      setConfig(filteredConfig);
      
      // Ensure we have valid initial data
      const safeData = initialData && typeof initialData === 'object' && initialData.content 
        ? initialData 
        : { content: [], root: {} };
      
      setEditorData(safeData);
      setIsReady(true);
    } catch (error) {
      console.error('MobilePuckEditor: Error initializing config:', error);
      setConfig(puckConfig);
      setEditorData({ content: [], root: {} });
      setIsReady(true);
    }
  }, [organizationId, initialData]);

  const handleChange = (data: any) => {
    try {
      console.log('MobilePuckEditor: Data changed', data);
      setEditorData(data);
      onChange?.(data);
    } catch (error) {
      console.error('MobilePuckEditor: Error handling change:', error);
    }
  };

  const handlePublish = (data: any) => {
    console.log('MobilePuckEditor: Publish triggered', data);
    onSave?.(data);
  };

  if (!isReady || !editorData) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading mobile editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <style>
        {`
          /* Mobile-specific Puck styling */
          .Puck {
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
          }
          
          /* Mobile header adjustments */
          .Puck-header {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 8px 12px !important;
            background: white !important;
            border-bottom: 1px solid #e5e7eb !important;
            flex-shrink: 0 !important;
          }
          
          /* Mobile publish button */
          .Puck-header-publishButton {
            display: inline-flex !important;
            align-items: center !important;
            gap: 4px !important;
            background: #3b82f6 !important;
            color: white !important;
            border: none !important;
            border-radius: 6px !important;
            padding: 6px 12px !important;
            font-size: 12px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
          }
          
          /* Mobile sidebar toggles */
          .Puck-sidebarToggle {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 1001 !important;
            background: white !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 50% !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
            width: 44px !important;
            height: 44px !important;
            cursor: pointer !important;
            position: fixed !important;
          }
          
          /* Position toggles for mobile */
          .Puck-sidebarToggle[aria-label*="Components"] {
            bottom: 80px !important;
            left: 16px !important;
          }
          
          .Puck-sidebarToggle[aria-label*="Fields"] {
            bottom: 80px !important;
            right: 16px !important;
          }
          
          /* Mobile sidebar behavior */
          .Puck-sideBar {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            max-width: 320px !important;
            height: 100vh !important;
            background: white !important;
            border-right: 1px solid #e5e7eb !important;
            z-index: 1000 !important;
            transform: translateX(-100%) !important;
            transition: transform 0.3s ease !important;
            overflow-y: auto !important;
          }
          
          .Puck-sideBar--open {
            transform: translateX(0) !important;
          }
          
          .Puck-fields {
            position: fixed !important;
            right: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            max-width: 320px !important;
            height: 100vh !important;
            background: white !important;
            border-left: 1px solid #e5e7eb !important;
            z-index: 1000 !important;
            transform: translateX(100%) !important;
            transition: transform 0.3s ease !important;
            overflow-y: auto !important;
          }
          
          .Puck-fields--open {
            transform: translateX(0) !important;
          }
          
          /* Mobile canvas */
          .Puck-frame {
            flex: 1 !important;
            width: 100% !important;
            background: #f9fafb !important;
            overflow: auto !important;
          }
          
          /* Mobile component styling */
          .Puck-component {
            margin-bottom: 8px !important;
            padding: 12px !important;
            background: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 6px !important;
            cursor: pointer !important;
            touch-action: manipulation !important;
          }
          
          .Puck-component:active {
            background: #e2e8f0 !important;
            transform: scale(0.98) !important;
          }
          
          /* Mobile drop zones */
          .Puck-dropZone {
            min-height: 12px !important;
            background: rgba(59, 130, 246, 0.1) !important;
            border: 2px dashed #3b82f6 !important;
            border-radius: 4px !important;
            margin: 4px 0 !important;
          }
          
          /* Backdrop when sidebars are open */
          .Puck-sideBar--open::before,
          .Puck-fields--open::before {
            content: '' !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            background: rgba(0, 0, 0, 0.5) !important;
            z-index: -1 !important;
          }
        `}
      </style>
      <Puck
        config={config}
        data={editorData}
        onChange={handleChange}
        onPublish={handlePublish}
      />
    </div>
  );
};

export default MobilePuckEditor;
