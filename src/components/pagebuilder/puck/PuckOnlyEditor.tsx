
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
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
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Enhanced data integrity function with better safety
const ensureDataIntegrity = (data: any): any => {
  console.log('PuckOnlyEditor: ensureDataIntegrity input:', data);
  
  if (!data || typeof data !== 'object') {
    console.log('PuckOnlyEditor: Creating default data structure');
    return {
      content: [],
      root: { props: {} }
    };
  }

  // Process content with enhanced safety
  const processedContent = Array.isArray(data.content) ? data.content.map((item, index) => {
    console.log(`PuckOnlyEditor: Processing content item ${index}:`, item);
    
    // Ensure every item has all required properties
    const safeItem = {
      id: item?.id || `safe-item-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      type: (item?.type && typeof item.type === 'string' && item.type.trim() !== '') ? item.type : 'Hero',
      props: {},
      readOnly: Boolean(item?.readOnly)
    };

    // Process props with enhanced safety
    if (item?.props && typeof item.props === 'object') {
      try {
        const safeProps: any = {};
        
        Object.entries(item.props).forEach(([key, value]) => {
          if (key && typeof key === 'string') {
            if (value === null || value === undefined) {
              safeProps[key] = '';
            } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
              safeProps[key] = value;
            } else if (Array.isArray(value)) {
              try {
                JSON.stringify(value);
                safeProps[key] = value;
              } catch (error) {
                console.warn(`Invalid array prop ${key}, using empty array`);
                safeProps[key] = [];
              }
            } else if (typeof value === 'object') {
              try {
                JSON.stringify(value);
                safeProps[key] = value;
              } catch (error) {
                console.warn(`Invalid object prop ${key}, using string representation`);
                safeProps[key] = String(value);
              }
            } else {
              try {
                const stringValue = String(value);
                safeProps[key] = stringValue === '[object Object]' ? '' : stringValue;
              } catch (error) {
                console.warn(`Cannot convert prop ${key} to string, using empty string`);
                safeProps[key] = '';
              }
            }
          }
        });
        
        safeItem.props = safeProps;
      } catch (error) {
        console.warn('Error processing props for item', index, error);
        safeItem.props = getDefaultPropsForType(safeItem.type);
      }
    } else {
      safeItem.props = getDefaultPropsForType(safeItem.type);
    }

    console.log(`PuckOnlyEditor: Processed item ${index}:`, safeItem);
    return safeItem;
  }) : [];

  // Ensure root has safe props
  const safeRoot = {
    props: {},
    ...(data.root?.title && typeof data.root.title === 'string' ? { title: data.root.title } : {})
  };

  if (data.root?.props && typeof data.root.props === 'object') {
    try {
      const rootProps: any = {};
      Object.entries(data.root.props).forEach(([key, value]) => {
        if (key && typeof key === 'string') {
          if (value === null || value === undefined) {
            rootProps[key] = '';
          } else if (typeof value === 'object') {
            try {
              JSON.stringify(value);
              rootProps[key] = value;
            } catch (error) {
              rootProps[key] = String(value);
            }
          } else {
            rootProps[key] = String(value);
          }
        }
      });
      safeRoot.props = rootProps;
    } catch (error) {
      console.warn('Error processing root props:', error);
      safeRoot.props = {};
    }
  }

  const result = {
    content: processedContent,
    root: safeRoot
  };
  
  console.log('PuckOnlyEditor: ensureDataIntegrity result:', result);
  return result;
};

// Get safe default props for component types
const getDefaultPropsForType = (type: string): Record<string, any> => {
  switch (type) {
    case 'Hero':
      return {
        title: 'Welcome to Your Website',
        subtitle: 'Create amazing experiences with our powerful tools',
        buttonText: 'Get Started',
        buttonLink: '#',
        backgroundImage: '',
        size: 'large',
        alignment: 'center'
      };
    case 'TextBlock':
      return {
        content: 'Add your content here',
        size: 'medium',
        alignment: 'left',
        color: '#000000'
      };
    case 'ServiceTimes':
      return {
        title: 'Service Times',
        layout: 'list',
        showIcon: true,
        backgroundColor: 'white',
        textColor: 'gray-900',
        customTimes: []
      };
    case 'ContactInfo':
      return {
        title: 'Contact Us',
        layout: 'vertical',
        showIcons: true,
        backgroundColor: 'white',
        textColor: 'gray-900'
      };
    default:
      return {
        content: 'Default content',
        text: 'Default text',
        title: 'Default title'
      };
  }
};

// Add enhanced error boundary and data sanitization
const sanitizeForDrag = (data: any): any => {
  if (data === null || data === undefined) {
    return {};
  }
  
  if (typeof data !== 'object') {
    return {};
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForDrag(item));
  }
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      sanitized[key] = '';
      continue;
    }
    
    if (typeof value === 'object') {
      sanitized[key] = sanitizeForDrag(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('PuckOnlyEditor: Initializing with:', { organizationId, initialData });
    
    try {
      const enabledComponents = [
        'Hero',
        'TextBlock',
        'Image',
        'Card',
        'Header',
        'EnhancedHeader',
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
      
      // Use the enhanced data integrity function
      const safeData = ensureDataIntegrity(initialData);
      
      console.log('PuckOnlyEditor: Safe data processed:', safeData);
      
      setEditorData(safeData);
      setIsReady(true);
    } catch (error) {
      console.error('PuckOnlyEditor: Error initializing config:', error);
      // Fallback to completely safe data
      const fallbackData = {
        content: [{
          id: `fallback-hero-${Date.now()}`,
          type: 'Hero',
          props: getDefaultPropsForType('Hero'),
          readOnly: false
        }],
        root: { props: {} }
      };
      setConfig(puckConfig);
      setEditorData(fallbackData);
      setIsReady(true);
    }
  }, [organizationId, initialData]);

  // Sanitize data to prevent drag errors
  const sanitizedData = useMemo(() => {
    try {
      if (!initialData) {
        return { content: [], root: {} };
      }
      
      const sanitized = sanitizeForDrag(initialData);
      
      // Ensure proper structure
      return {
        content: Array.isArray(sanitized.content) ? sanitized.content : [],
        root: sanitized.root || {}
      };
    } catch (err) {
      console.error('PuckOnlyEditor: Error sanitizing data:', err);
      return { content: [], root: {} };
    }
  }, [initialData]);

  const handleChange = useCallback((data: any) => {
    try {
      console.log('PuckOnlyEditor: Data changed', {
        hasContent: !!data?.content,
        contentLength: data?.content?.length || 0,
        hasRoot: !!data?.root
      });
      
      // Ensure data structure is valid before processing
      if (!data || typeof data !== 'object') {
        console.warn('PuckOnlyEditor: Invalid data structure, using fallback');
        data = { content: [], root: {} };
      }
      
      // Ensure content array exists
      if (!Array.isArray(data.content)) {
        console.warn('PuckOnlyEditor: Invalid content array, creating empty array');
        data.content = [];
      }
      
      // Ensure root object exists
      if (!data.root || typeof data.root !== 'object') {
        console.warn('PuckOnlyEditor: Invalid root object, creating empty object');
        data.root = {};
      }
      
      // Validate all content items have proper structure
      data.content = data.content.map((item: any, index: number) => {
        if (!item || typeof item !== 'object') {
          console.warn(`PuckOnlyEditor: Invalid content item at index ${index}, creating fallback`);
          return { 
            type: 'TextBlock', 
            props: { content: 'Invalid content item' },
            readOnly: false
          };
        }
        
        // Ensure all required properties exist
        if (!item.type) {
          console.warn(`PuckOnlyEditor: Missing type for content item at index ${index}`);
          item.type = 'TextBlock';
        }
        
        if (!item.props || typeof item.props !== 'object') {
          console.warn(`PuckOnlyEditor: Invalid props for content item at index ${index}`);
          item.props = {};
        }
        
        // For GridBlock items, ensure props are properly structured
        if (item.type === 'GridBlock') {
          item.props = {
            columns: typeof item.props.columns === 'number' ? item.props.columns : 3,
            gap: typeof item.props.gap === 'string' ? item.props.gap : '1rem',
            backgroundColor: typeof item.props.backgroundColor === 'string' ? item.props.backgroundColor : 'transparent',
            padding: typeof item.props.padding === 'string' ? item.props.padding : '1rem',
            minHeight: typeof item.props.minHeight === 'string' ? item.props.minHeight : '200px',
            equalHeight: typeof item.props.equalHeight === 'boolean' ? item.props.equalHeight : true,
            ...item.props
          };
        }
        
        return item;
      });
      
      setEditorData(data);
      onChange?.(data);
    } catch (error) {
      console.error('PuckOnlyEditor: Error handling change:', error);
      // Provide fallback data to prevent editor crash
      const fallbackData = { content: [], root: {} };
      setEditorData(fallbackData);
      onChange?.(fallbackData);
    }
  }, [onChange]);

  const handlePublish = useCallback((data: any) => {
    try {
      console.log('PuckOnlyEditor: Publish triggered with data:', data);
      const safeData = ensureDataIntegrity(data);
      onSave?.(safeData);
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

  console.log('PuckOnlyEditor: Rendering with data:', editorData);

  return (
    <div className="h-full w-full relative">
      <style>
        {`
          /* Core Puck editor layout fixes with enhanced drag safety */
          .Puck {
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
          }
          
          /* Enhanced drag system safety - prevent crashes during drag operations */
          .Puck [data-rfd-droppable-id] {
            min-height: 20px !important;
            position: relative !important;
          }
          
          .Puck [data-rfd-draggable-id] {
            position: relative !important;
            transform-origin: center !important;
          }
          
          .Puck-componentWrapper {
            position: relative !important;
            will-change: transform !important;
            min-height: 20px !important;
            transition: none !important;
          }
          
          /* Prevent pointer events during drag to avoid crashes */
          .Puck-componentWrapper--isDragging {
            pointer-events: none !important;
            z-index: 1000 !important;
          }
          
          .Puck-componentWrapper--selected {
            outline: 2px solid #3b82f6 !important;
            outline-offset: 2px !important;
          }
          
          .Puck-dropZone {
            min-height: 24px !important;
            background: rgba(59, 130, 246, 0.1) !important;
            border: 2px dashed #3b82f6 !important;
            border-radius: 4px !important;
            transition: all 0.2s ease !important;
            margin: 4px 0 !important;
            position: relative !important;
          }
          
          .Puck-dropZone--active {
            background: rgba(59, 130, 246, 0.2) !important;
            border-color: #2563eb !important;
            min-height: 32px !important;
          }
          
          .Puck-dropZone::after {
            content: "Drop component here" !important;
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            color: #3b82f6 !important;
            font-size: 12px !important;
            pointer-events: none !important;
            opacity: 0 !important;
            transition: opacity 0.2s ease !important;
          }
          
          .Puck-dropZone--active::after {
            opacity: 1 !important;
          }

          /* Prevent text selection during drag operations */
          .Puck-frame {
            user-select: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
          }
          
          /* Rest of the existing styles... */
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
        `}
      </style>
      <PuckErrorBoundary fallback={
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center">
            <div className="h-6 w-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Error in Puck editor...</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Editor
            </button>
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
