import React, { useEffect, useState, useCallback } from 'react';
import { Puck } from '@measured/puck';
import { puckConfig, createFilteredPuckConfig } from './config/PuckConfig';
import '@measured/puck/puck.css';

// Error Boundary Component to catch Puck-related errors
class PuckErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('PuckErrorBoundary: Caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('PuckErrorBoundary: Error details:', error, errorInfo);
    
    // Log specific toString errors
    if (error.message.includes('toString') || error.message.includes('undefined')) {
      console.error('PuckErrorBoundary: toString error detected - likely missing props in Puck component');
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

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
        'Hero',
        'TextBlock',
        'Image',
        'Card',
        'Header',
        'Footer',
        'Stats',
        'Testimonial',
        'ContactForm',
        'VideoEmbed',
        'ImageGallery',
        'ServiceTimes',
        'ContactInfo', 
        'ChurchStats',
        'EventCalendar'
      ];
      
      const filteredConfig = createFilteredPuckConfig(enabledComponents);
      setConfig(filteredConfig);
      
      // Ensure we have valid initial data with proper structure and safe defaults
      const safeData = initialData && typeof initialData === 'object' && initialData.content 
        ? {
            content: Array.isArray(initialData.content) ? initialData.content.map((item, index) => {
              if (!item || typeof item !== 'object') {
                console.warn(`PuckOnlyEditor: Invalid content item at index ${index}, creating default`);
                return {
                  type: 'TextBlock',
                  props: {
                    text: 'Default text content',
                    textAlign: 'left',
                    color: '#000000'
                  },
                  readOnly: false
                };
              }
              
              // Ensure all props have safe string values to prevent toString errors
              const safeProps = item.props && typeof item.props === 'object' ? 
                Object.fromEntries(
                  Object.entries(item.props).map(([key, value]) => [
                    key, 
                    value === null || value === undefined ? '' : 
                    typeof value === 'object' ? JSON.stringify(value) : 
                    String(value)
                  ])
                ) : {};
              
              return {
                type: typeof item.type === 'string' && item.type.trim() !== '' ? item.type : 'TextBlock',
                props: safeProps,
                readOnly: Boolean(item.readOnly)
              };
            }) : [],
            root: initialData.root && typeof initialData.root === 'object' ? {
              props: initialData.root.props && typeof initialData.root.props === 'object' ? 
                Object.fromEntries(
                  Object.entries(initialData.root.props).map(([key, value]) => [
                    key, 
                    value === null || value === undefined ? '' : 
                    typeof value === 'object' ? JSON.stringify(value) : 
                    String(value)
                  ])
                ) : {},
              ...(initialData.root.title && typeof initialData.root.title === 'string' ? { title: initialData.root.title } : {})
            } : { props: {} }
          }
        : { 
            content: [], 
            root: { props: {} } 
          };
      
      console.log('PuckOnlyEditor: Initialized with safe data:', {
        contentCount: safeData.content.length,
        hasRoot: !!safeData.root,
        organizationId
      });
      
      setEditorData(safeData);
      setIsReady(true);
    } catch (error) {
      console.error('PuckOnlyEditor: Error initializing config:', error);
      // Fallback to basic config with minimal data
      setConfig(puckConfig);
      setEditorData({ content: [], root: { props: {} } });
      setIsReady(true);
    }
  }, [organizationId, initialData]);

  const handleChange = useCallback((data: any) => {
    try {
      console.log('PuckOnlyEditor: Raw data received:', data);
      
      // Validate data structure before processing
      if (!data || typeof data !== 'object') {
        console.warn('PuckOnlyEditor: Invalid data received in onChange, using fallback');
        const fallbackData = { content: [], root: { props: {} } };
        setEditorData(fallbackData);
        onChange?.(fallbackData);
        return;
      }

      // Ensure content is an array with safe defaults and string-safe props
      const safeContent = Array.isArray(data.content) ? data.content.map((item, index) => {
        if (!item || typeof item !== 'object') {
          console.warn(`PuckOnlyEditor: Invalid content item at index ${index}, creating default`);
          return {
            type: 'TextBlock',
            props: {
              text: 'Default text content',
              textAlign: 'left',
              color: '#000000'
            },
            readOnly: false
          };
        }

        // Safely extract and validate properties
        const itemType = item.type;
        const itemProps = item.props;
        const itemReadOnly = item.readOnly;

        // Validate type
        if (typeof itemType !== 'string' || itemType.trim() === '') {
          console.warn(`PuckOnlyEditor: Invalid type at index ${index}:`, itemType);
          return {
            type: 'TextBlock',
            props: {
              text: 'Default text content',
              textAlign: 'left',
              color: '#000000'
            },
            readOnly: Boolean(itemReadOnly)
          };
        }

        // Validate props - ensure all values are strings or safe primitives
        let safeProps = {};
        if (itemProps && typeof itemProps === 'object') {
          try {
            // Convert all props to safe string values to prevent toString errors
            safeProps = Object.fromEntries(
              Object.entries(itemProps).map(([key, value]) => [
                key, 
                value === null || value === undefined ? '' : 
                typeof value === 'object' ? JSON.stringify(value) : 
                String(value)
              ])
            );
            // Test if props can be serialized
            JSON.stringify(safeProps);
          } catch (error) {
            console.warn(`PuckOnlyEditor: Props not serializable at index ${index}:`, error);
            safeProps = {
              text: 'Default content',
              textAlign: 'left',
              color: '#000000'
            };
          }
        }

        return {
          type: itemType,
          props: safeProps,
          readOnly: Boolean(itemReadOnly)
        };
      }) : [];

      // Ensure root is a proper object with safe defaults and string-safe props
      const safeRoot = data.root && typeof data.root === 'object' ? {
        props: data.root.props && typeof data.root.props === 'object' ? 
          Object.fromEntries(
            Object.entries(data.root.props).map(([key, value]) => [
              key, 
              value === null || value === undefined ? '' : 
              typeof value === 'object' ? JSON.stringify(value) : 
              String(value)
            ])
          ) : {},
        ...(data.root.title && typeof data.root.title === 'string' ? { title: data.root.title } : {})
      } : { props: {} };

      const validatedData = {
        content: safeContent,
        root: safeRoot
      };

      // Final validation - ensure the result can be JSON serialized
      try {
        JSON.stringify(validatedData);
        console.log('PuckOnlyEditor: Data successfully validated', {
          contentCount: validatedData.content.length,
          hasRoot: !!validatedData.root
        });
        
        setEditorData(validatedData);
        onChange?.(validatedData);
      } catch (serializationError) {
        console.error('PuckOnlyEditor: Final serialization check failed:', serializationError);
        const fallbackData = { content: [], root: { props: {} } };
        setEditorData(fallbackData);
        onChange?.(fallbackData);
      }
    } catch (error) {
      console.error('PuckOnlyEditor: Critical error in handleChange:', error);
      // Don't crash - provide fallback data
      const fallbackData = { content: [], root: { props: {} } };
      setEditorData(fallbackData);
      onChange?.(fallbackData);
    }
  }, [onChange]);

  // Handle publish - call external save handler
  const handlePublish = useCallback((data: any) => {
    try {
      console.log('PuckOnlyEditor: Publish triggered');
      onSave?.(data);
    } catch (error) {
      console.error('PuckOnlyEditor: Error in publish handler:', error);
    }
  }, [onSave]);

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
          /* Core Puck editor layout fixes */
          .Puck {
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
          }
          
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
          
          .Puck-header-actions {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
          }
          
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
          
          .Puck-root {
            display: flex !important;
            flex: 1 !important;
            min-height: 0 !important;
            overflow: hidden !important;
          }
          
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
          
          .Puck-frame {
            flex: 1 !important;
            min-width: 0 !important;
            background: #f9fafb !important;
            overflow: auto !important;
            display: flex !important;
            flex-direction: column !important;
          }
          
          .Puck-frame iframe {
            width: 100% !important;
            height: 100% !important;
            border: none !important;
            flex: 1 !important;
          }
          
          .Puck-preview {
            flex: 1 !important;
            overflow: auto !important;
            padding: 20px !important;
            background: white !important;
            min-height: 100vh !important;
          }
          
          /* Sidebar toggle buttons */
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
          
          /* Drag and drop improvements with error prevention */
          .Puck-componentWrapper {
            position: relative !important;
            will-change: transform !important;
          }
          
          .Puck-componentWrapper--selected {
            outline: 2px solid #3b82f6 !important;
            outline-offset: 2px !important;
          }
          
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
          
          .Puck-fields > div {
            flex: 1 !important;
            overflow-y: auto !important;
            padding: 16px !important;
          }
          
          .Puck-dragOverlay {
            z-index: 9999 !important;
            pointer-events: none !important;
          }
          
          /* Mobile responsive improvements */
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
        `}
      </style>
      <PuckErrorBoundary fallback={
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center">
            <div className="h-6 w-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Error in Puck editor...</p>
          </div>
        </div>
      }>
        <Puck
          config={config}
          data={editorData}
          onChange={handleChange}
          onPublish={handlePublish}
        />
      </PuckErrorBoundary>
    </div>
  );
};

export default PuckOnlyEditor;
