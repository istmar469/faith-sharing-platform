
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
      console.error('PuckOnlyEditor: Error initializing config:', error);
      // Fallback to basic config
      setConfig(puckConfig);
      setEditorData({ content: [], root: {} });
      setIsReady(true);
    }
  }, [organizationId, initialData]);

  const handleChange = (data: any) => {
    try {
      console.log('PuckOnlyEditor: Data changed', data);
      setEditorData(data);
      onChange?.(data);
    } catch (error) {
      console.error('PuckOnlyEditor: Error handling change:', error);
    }
  };

  // Handle publish - call external save handler
  const handlePublish = (data: any) => {
    console.log('PuckOnlyEditor: Publish triggered', data);
    onSave?.(data);
  };

  if (!isReady || !editorData) {
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
          /* Ensure Puck editor takes full height */
          .Puck {
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
          }
          
          /* Keep Puck header visible with all controls */
          .Puck-header {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 8px 16px !important;
            background: white !important;
            border-bottom: 1px solid #e5e7eb !important;
            flex-shrink: 0 !important;
          }
          
          /* Ensure publish button is visible and styled properly */
          .Puck-header-publishButton {
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px !important;
            background: #3b82f6 !important;
            color: white !important;
            border: none !important;
            border-radius: 6px !important;
            padding: 8px 16px !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
          }
          
          .Puck-header-publishButton:hover {
            background: #2563eb !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3) !important;
          }
          
          /* Ensure sidebar toggle buttons are visible and accessible */
          .Puck-sidebarToggle {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 100 !important;
            background: white !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 6px !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
            padding: 8px !important;
            margin: 4px !important;
            width: 32px !important;
            height: 32px !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            position: relative !important;
          }
          
          .Puck-sidebarToggle:hover {
            background: #f8fafc !important;
            border-color: #3b82f6 !important;
            transform: scale(1.05) !important;
          }
          
          /* Ensure the main layout is responsive */
          .Puck-root {
            display: flex !important;
            flex: 1 !important;
            min-height: 0 !important;
          }
          
          /* Ensure sidebars have proper width and positioning */
          .Puck-sideBar {
            width: 280px !important;
            background: white !important;
            border-right: 1px solid #e5e7eb !important;
            flex-shrink: 0 !important;
            overflow-y: auto !important;
          }
          
          .Puck-fields {
            width: 280px !important;
            background: white !important;
            border-left: 1px solid #e5e7eb !important;
            flex-shrink: 0 !important;
            overflow-y: auto !important;
          }
          
          /* Make sure the canvas area is responsive */
          .Puck-frame {
            flex: 1 !important;
            min-width: 0 !important;
            transition: margin 0.3s ease !important;
            background: #f9fafb !important;
            overflow: auto !important;
          }
          
          /* Improve component selection visibility */
          .Puck-componentWrapper--selected {
            outline: 2px solid #3b82f6 !important;
            outline-offset: 2px !important;
          }
          
          /* Improve drag and drop experience */
          .Puck-dragOverlay {
            z-index: 9999 !important;
            pointer-events: none !important;
          }
          
          .Puck-dropZone {
            min-height: 8px !important;
            background: rgba(59, 130, 246, 0.1) !important;
            border: 2px dashed #3b82f6 !important;
            border-radius: 4px !important;
            transition: all 0.2s ease !important;
          }
          
          .Puck-dropZone--active {
            background: rgba(59, 130, 246, 0.2) !important;
            border-color: #2563eb !important;
          }
          
          /* Component list styling */
          .Puck-componentList {
            padding: 16px !important;
          }
          
          .Puck-component {
            margin-bottom: 8px !important;
            padding: 12px !important;
            background: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 6px !important;
            cursor: grab !important;
            transition: all 0.2s ease !important;
          }
          
          .Puck-component:hover {
            background: #e2e8f0 !important;
            border-color: #3b82f6 !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
          }
          
          .Puck-component:active {
            cursor: grabbing !important;
          }
          
          /* Responsive behavior for mobile */
          @media (max-width: 768px) {
            .Puck-sideBar {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              height: 100vh !important;
              z-index: 1000 !important;
              transform: translateX(-100%) !important;
              transition: transform 0.3s ease !important;
            }
            
            .Puck-sideBar--open {
              transform: translateX(0) !important;
            }
            
            .Puck-fields {
              position: fixed !important;
              right: 0 !important;
              top: 0 !important;
              height: 100vh !important;
              z-index: 1000 !important;
              transform: translateX(100%) !important;
              transition: transform 0.3s ease !important;
            }
            
            .Puck-fields--open {
              transform: translateX(0) !important;
            }
            
            .Puck-frame {
              width: 100% !important;
            }
          }
          
          /* Tablet adjustments */
          @media (max-width: 1024px) {
            .Puck-sideBar {
              width: 240px !important;
            }
            
            .Puck-fields {
              width: 240px !important;
            }
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

export default PuckOnlyEditor;
