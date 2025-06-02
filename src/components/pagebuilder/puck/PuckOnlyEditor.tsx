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

// Helper function to ensure ALL data has proper structure for drag system
const ensureDataIntegrity = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return {
      content: [],
      root: { props: {} }
    };
  }

  const processedContent = Array.isArray(data.content) ? data.content.map((item, index) => {
    // Ensure every item has all required properties for drag system
    const safeItem = {
      id: item?.id || `safe-item-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      type: (item?.type && typeof item.type === 'string' && item.type.trim() !== '') ? item.type : 'TextBlock',
      props: {},
      readOnly: Boolean(item?.readOnly)
    };

    // Process props safely
    if (item?.props && typeof item.props === 'object') {
      try {
        safeItem.props = Object.fromEntries(
          Object.entries(item.props)
            .filter(([key, value]) => key && typeof key === 'string')
            .map(([key, value]) => [
              key,
              value === null || value === undefined ? '' :
              typeof value === 'object' ? JSON.stringify(value) :
              String(value)
            ])
        );
      } catch (error) {
        console.warn('PuckOnlyEditor: Error processing props for item', index, error);
        safeItem.props = { content: 'Safe default content' };
      }
    } else {
      // Set safe default props based on component type
      switch (safeItem.type) {
        case 'TextBlock':
          safeItem.props = { content: 'Default text content', size: 'medium', alignment: 'left' };
          break;
        case 'Hero':
          safeItem.props = { title: 'Hero Title', subtitle: 'Hero Subtitle' };
          break;
        case 'Card':
          safeItem.props = { title: 'Card Title', description: 'Card Description' };
          break;
        default:
          safeItem.props = { content: 'Default content' };
      }
    }

    return safeItem;
  }) : [];

  return {
    content: processedContent,
    root: {
      props: data.root?.props && typeof data.root.props === 'object' ? 
        Object.fromEntries(
          Object.entries(data.root.props)
            .filter(([key, value]) => key && typeof key === 'string')
            .map(([key, value]) => [
              key,
              value === null || value === undefined ? '' :
              typeof value === 'object' ? JSON.stringify(value) :
              String(value)
            ])
        ) : {},
      ...(data.root?.title && typeof data.root.title === 'string' ? { title: data.root.title } : {})
    }
  };
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
      
      // Use the enhanced data integrity function
      const safeData = ensureDataIntegrity(initialData);
      
      console.log('PuckOnlyEditor: Initialized with safe data:', {
        contentCount: safeData.content.length,
        hasRoot: !!safeData.root,
        organizationId,
        sampleIds: safeData.content.slice(0, 3).map(item => item.id)
      });
      
      setEditorData(safeData);
      setIsReady(true);
    } catch (error) {
      console.error('PuckOnlyEditor: Error initializing config:', error);
      // Fallback to completely safe data
      const fallbackData = ensureDataIntegrity(null);
      setConfig(puckConfig);
      setEditorData(fallbackData);
      setIsReady(true);
    }
  }, [organizationId, initialData]);

  const handleChange = useCallback((data: any) => {
    try {
      console.log('PuckOnlyEditor: Raw data received:', data);
      
      // Use the enhanced data integrity function
      const validatedData = ensureDataIntegrity(data);
      
      console.log('PuckOnlyEditor: Data successfully validated', {
        contentCount: validatedData.content.length,
        hasRoot: !!validatedData.root,
        sampleIds: validatedData.content.slice(0, 3).map(item => item.id)
      });
      
      setEditorData(validatedData);
      onChange?.(validatedData);
    } catch (error) {
      console.error('PuckOnlyEditor: Critical error in handleChange:', error);
      // Use fallback data that's guaranteed to be safe
      const fallbackData = ensureDataIntegrity(null);
      setEditorData(fallbackData);
      onChange?.(fallbackData);
    }
  }, [onChange]);

  // Handle publish - call external save handler
  const handlePublish = useCallback((data: any) => {
    try {
      console.log('PuckOnlyEditor: Publish triggered');
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
          
          /* Enhanced drag system safety */
          .Puck [data-rfd-droppable-id] {
            min-height: 20px !important;
          }
          
          .Puck [data-rfd-draggable-id] {
            position: relative !important;
          }
          
          .Puck-componentWrapper {
            position: relative !important;
            will-change: transform !important;
            min-height: 20px !important;
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
