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
    <div className="h-full w-full relative">
      <style>
        {`
          /* FIXED: Ensure Puck editor takes full height and can scroll properly */
          .Puck {
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
          }
          
          /* FIXED: Make sure header has fixed height */
          .Puck-header {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 12px 16px !important;
            background: white !important;
            border-bottom: 1px solid #e5e7eb !important;
            flex-shrink: 0 !important;
            min-height: 60px !important;
            z-index: 10 !important;
          }
          
          /* FIXED: Ensure publish button is visible and functional */
          .Puck-header-publishButton {
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px !important;
            background: #3b82f6 !important;
            color: white !important;
            border: none !important;
            border-radius: 6px !important;
            padding: 10px 16px !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            min-width: 100px !important;
          }
          
          .Puck-header-publishButton:hover {
            background: #2563eb !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3) !important;
          }
          
          /* FIXED: Ensure root layout is flexible */
          .Puck-root {
            display: flex !important;
            flex: 1 !important;
            min-height: 0 !important;
            overflow: hidden !important;
          }
          
          /* FIXED: Ensure sidebars have proper scrolling */
          .Puck-sideBar {
            width: 300px !important;
            background: white !important;
            border-right: 1px solid #e5e7eb !important;
            flex-shrink: 0 !important;
            overflow-y: auto !important;
            display: flex !important;
            flex-direction: column !important;
          }
          
          .Puck-fields {
            width: 280px !important;
            background: white !important;
            border-left: 1px solid #e5e7eb !important;
            flex-shrink: 0 !important;
            overflow-y: auto !important;
            display: flex !important;
            flex-direction: column !important;
          }
          
          /* FIXED: The main canvas area - this is crucial for scrolling */
          .Puck-frame {
            flex: 1 !important;
            min-width: 0 !important;
            background: #f9fafb !important;
            overflow: auto !important;
            display: flex !important;
            flex-direction: column !important;
          }
          
          /* FIXED: Ensure the iframe content can scroll properly */
          .Puck-frame iframe {
            width: 100% !important;
            height: 100% !important;
            border: none !important;
            flex: 1 !important;
          }
          
          /* FIXED: Make the preview area scrollable */
          .Puck-preview {
            flex: 1 !important;
            overflow: auto !important;
            padding: 20px !important;
            background: white !important;
            min-height: 100vh !important;
          }
          
          /* FIXED: Ensure sidebar toggle buttons are visible and positioned properly */
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
            width: 36px !important;
            height: 36px !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            position: absolute !important;
          }
          
          /* Position toggles properly */
          .Puck-sidebarToggle[data-side="left"] {
            left: 4px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
          }
          
          .Puck-sidebarToggle[data-side="right"] {
            right: 4px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
          }
          
          .Puck-sidebarToggle:hover {
            background: #f8fafc !important;
            border-color: #3b82f6 !important;
            transform: translateY(-50%) scale(1.05) !important;
          }
          
          /* FIXED: Component selection and interaction */
          .Puck-componentWrapper--selected {
            outline: 2px solid #3b82f6 !important;
            outline-offset: 2px !important;
            position: relative !important;
          }
          
          /* FIXED: Drag and drop areas */
          .Puck-dropZone {
            min-height: 12px !important;
            background: rgba(59, 130, 246, 0.1) !important;
            border: 2px dashed #3b82f6 !important;
            border-radius: 4px !important;
            transition: all 0.2s ease !important;
            margin: 4px 0 !important;
          }
          
          .Puck-dropZone--active {
            background: rgba(59, 130, 246, 0.2) !important;
            border-color: #2563eb !important;
            min-height: 24px !important;
          }
          
          /* FIXED: Component list styling in sidebar */
          .Puck-componentList {
            padding: 16px !important;
            flex: 1 !important;
            overflow-y: auto !important;
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
            transform: translateY(0) !important;
          }
          
          /* FIXED: Ensure fields panel content is scrollable */
          .Puck-fields > div {
            flex: 1 !important;
            overflow-y: auto !important;
            padding: 16px !important;
          }
          
          /* FIXED: Responsive behavior improvements */
          @media (max-width: 1200px) {
            .Puck-sideBar {
              width: 260px !important;
            }
            
            .Puck-fields {
              width: 260px !important;
            }
          }
          
          @media (max-width: 768px) {
            .Puck-sideBar {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              height: 100vh !important;
              z-index: 1000 !important;
              transform: translateX(-100%) !important;
              transition: transform 0.3s ease !important;
              width: 280px !important;
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
              width: 280px !important;
            }
            
            .Puck-fields--open {
              transform: translateX(0) !important;
            }
            
            .Puck-frame {
              width: 100% !important;
            }
          }
          
          /* FIXED: Ensure proper scrolling for long content */
          .Puck-canvas {
            min-height: 100vh !important;
            padding-bottom: 100px !important;
          }
          
          /* Performance optimizations */
          .Puck-componentWrapper {
            will-change: transform !important;
          }
          
          .Puck-dragOverlay {
            z-index: 9999 !important;
            pointer-events: none !important;
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
