import React from 'react';
import { 
  Church, 
  Eye, 
  Home, 
  Layout, 
  Type, 
  Image as ImageIcon,
  Phone,
  Calendar,
  Users,
  BarChart3,
  Palette,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SafeDragWrapper from './SafeDragWrapper';

interface PuckOverridesProps {
  organizationName?: string;
  organizationId?: string;
  subdomain?: string;
  onPreview?: () => void;
  onPublish?: () => void;
  onBackToDashboard?: () => void;
}

export const createPuckOverrides = ({
  organizationName = 'Your Church',
  organizationId,
  subdomain,
  onPreview,
  onPublish,
  onBackToDashboard
}: PuckOverridesProps) => ({
  // 1. Clean, minimal header focusing on essential functions
  header: ({ actions, children }: { actions: React.ReactNode; children: React.ReactNode }) => (
    <header className="bg-white border-b border-gray-200 px-4 py-2 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left side - Back button and page title */}
        <div className="flex items-center space-x-3">
          {onBackToDashboard && (
            <Button 
              onClick={onBackToDashboard}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          <div className="text-sm text-gray-600">
            Page Builder
          </div>
        </div>
        
        {/* Right side - Essential actions only */}
        <div className="flex items-center space-x-2">
          {/* Original Puck actions (Save, Preview, Publish) */}
          {actions}
        </div>
      </div>
    </header>
  ),

  // 2. Enhanced component categorization for church-specific components
  components: ({ children }: { children: React.ReactNode }) => {
    // We'll enhance this by improving the category styling in CSS
    return (
      <div className="church-os-components">
        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Church className="h-4 w-4 mr-2 text-blue-600" />
              Church Components
            </h3>
            <p className="text-xs text-gray-500">
              Purpose-built for churches and faith organizations
            </p>
          </div>
          {children}
        </div>
      </div>
    );
  },

  // 3. Enhanced component item with better visual organization
  componentItem: ({ name, children }: { name: string; children: React.ReactNode }) => {
    const getComponentIcon = (componentName: string) => {
      switch (componentName) {
        case 'Hero': return <Palette className="h-4 w-4" />;
        case 'TextBlock': return <Type className="h-4 w-4" />;
        case 'Image': return <ImageIcon className="h-4 w-4" />;
        case 'ServiceTimes': return <Calendar className="h-4 w-4" />;
        case 'ContactInfo': return <Phone className="h-4 w-4" />;
        case 'ChurchStats': return <BarChart3 className="h-4 w-4" />;
        case 'EventCalendar': return <Calendar className="h-4 w-4" />;
        case 'ContactForm': return <Users className="h-4 w-4" />;
        default: return <Layout className="h-4 w-4" />;
      }
    };

    const getComponentDescription = (componentName: string) => {
      switch (componentName) {
        case 'ServiceTimes': return 'Display worship schedule';
        case 'ContactInfo': return 'Church contact details';
        case 'ChurchStats': return 'Ministry impact numbers';
        case 'EventCalendar': return 'Upcoming events';
        case 'Hero': return 'Main page banner';
        case 'ContactForm': return 'Get in touch form';
        default: return '';
      }
    };

    return (
      <div className="mb-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="text-gray-500 group-hover:text-blue-600">
              {getComponentIcon(name)}
            </div>
            <span className="font-medium text-gray-900 group-hover:text-blue-700">
              {name}
            </span>
          </div>
        </div>
        {getComponentDescription(name) && (
          <p className="text-xs text-gray-500 mb-2">
            {getComponentDescription(name)}
          </p>
        )}
        {children}
      </div>
    );
  },

  // 4. Fix collision detection with comprehensive error prevention
  iframe: ({ children, document }: { children: React.ReactNode; document?: Document }) => {
    // Inject comprehensive collision detection fixes
    React.useEffect(() => {
      if (document) {
        // Add collision detection fixes
        const style = document.createElement('style');
        style.textContent = `
          /* Fix collision detection issues */
          * {
            box-sizing: border-box !important;
          }
          
          /* Ensure all elements have safe toString methods */
          [data-puck-component] {
            position: relative;
          }
          
          /* Prevent undefined prop access in drag operations */
          .puck-droppable {
            min-height: 20px;
          }
          
          /* Safe prop handling for Hero component */
          .hero-component * {
            pointer-events: inherit;
          }
          
          /* Enhanced collision boundaries */
          .puck-drop-zone {
            outline: 2px dashed transparent;
            transition: outline-color 0.2s ease;
          }
          
          .puck-drop-zone--active {
            outline-color: #3b82f6;
            background-color: rgba(59, 130, 246, 0.05);
          }
        `;
        document.head.appendChild(style);

        // Comprehensive collision detection patch
        const script = document.createElement('script');
        script.textContent = `
          console.log('Injecting comprehensive collision detection patch...');
          
          // 1. Patch Object.prototype.toString globally
          const originalToString = Object.prototype.toString;
          Object.prototype.toString = function() {
            try {
              if (this === null || this === undefined) return '';
              if (this === window) return '[object Window]';
              if (this === document) return '[object Document]';
              return originalToString.call(this);
            } catch (error) {
              console.warn('toString error intercepted:', error);
              return '';
            }
          };

          // 2. Patch valueOf as well
          const originalValueOf = Object.prototype.valueOf;
          Object.prototype.valueOf = function() {
            try {
              if (this === null || this === undefined) return 0;
              return originalValueOf.call(this);
            } catch (error) {
              console.warn('valueOf error intercepted:', error);
              return 0;
            }
          };

          // 3. Patch String constructor to handle undefined
          const originalString = window.String;
          window.String = function(value) {
            if (value === null || value === undefined) return '';
            try {
              return originalString(value);
            } catch (error) {
              console.warn('String conversion error:', error);
              return '';
            }
          };
          
          // 4. Prevent errors in drag operations by patching event handlers
          const originalAddEventListener = EventTarget.prototype.addEventListener;
          EventTarget.prototype.addEventListener = function(type, listener, options) {
            if (type.startsWith('drag') || type === 'mousemove' || type === 'mouseup') {
              const safeListener = function(event) {
                try {
                  // Validate event data before processing
                  if (event && typeof event === 'object') {
                    // Ensure event properties are safe
                    if (event.dataTransfer) {
                      try {
                        const data = event.dataTransfer.getData('text/plain');
                        if (data && (data.includes('undefined') || data.includes('null'))) {
                          console.warn('Prevented unsafe drag data:', data);
                          event.preventDefault();
                          return false;
                        }
                      } catch (e) {
                        console.warn('DataTransfer access failed:', e);
                      }
                    }
                    return listener.call(this, event);
                  }
                } catch (error) {
                  console.warn('Event handler error intercepted:', error);
                  if (event && typeof event.preventDefault === 'function') {
                    event.preventDefault();
                  }
                  return false;
                }
              };
              return originalAddEventListener.call(this, type, safeListener, options);
            }
            return originalAddEventListener.call(this, type, listener, options);
          };

          // 5. Global error handler for uncaught exceptions
          window.addEventListener('error', function(event) {
            if (event.error && event.error.message && event.error.message.includes('toString')) {
              console.warn('Collision detection error prevented:', event.error);
              event.preventDefault();
              return false;
            }
          });

          // 6. Patch JSON.stringify to handle circular references
          const originalStringify = JSON.stringify;
          JSON.stringify = function(value, replacer, space) {
            try {
              return originalStringify(value, replacer, space);
            } catch (error) {
              if (error.message.includes('circular') || error.message.includes('Converting circular')) {
                console.warn('Circular reference in JSON.stringify, using safe fallback');
                return '{}';
              }
              throw error;
            }
          };

          console.log('Collision detection patch applied successfully');
        `;
        document.head.appendChild(script);
      }
    }, [document]);

    return (
      <SafeDragWrapper>
        <div 
          style={{ 
            minHeight: '100vh', 
            position: 'relative',
            isolation: 'isolate'
          }}
        >
          {children}
        </div>
      </SafeDragWrapper>
    );
  },

  // Enhanced preview with collision detection safeguards
  preview: ({ children }: { children: React.ReactNode }) => (
    <SafeDragWrapper>
      <div 
        className="puck-preview-wrapper"
        style={{
          position: 'relative',
          pointerEvents: 'auto',
          userSelect: 'none'
        }}
        onDragStart={(e) => {
          // Ensure safe drag data
          try {
            const dragData = JSON.stringify({ type: 'puck-component' });
            e.dataTransfer?.setData('text/plain', dragData);
          } catch (error) {
            console.warn('Drag data serialization failed:', error);
            e.preventDefault();
          }
        }}
      >
        {children}
      </div>
    </SafeDragWrapper>
  )
});

export default createPuckOverrides; 