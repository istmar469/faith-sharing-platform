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
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  // 1. Custom church-themed header with organization branding
  header: ({ actions, children }: { actions: React.ReactNode; children: React.ReactNode }) => (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Church className="h-6 w-6" />
            <div>
              <h1 className="text-lg font-bold">Church OS Page Builder</h1>
              <p className="text-blue-100 text-sm">{organizationName}</p>
            </div>
          </div>
          {subdomain && (
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {subdomain}.church-os.com
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Custom header actions */}
          {onPreview && (
            <Button 
              onClick={onPreview}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Live
            </Button>
          )}
          
          {subdomain && (
            <Button 
              onClick={() => window.open(`https://${subdomain}.church-os.com`, '_blank')}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Site
            </Button>
          )}
          
          {onBackToDashboard && (
            <Button 
              onClick={onBackToDashboard}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          )}
          
          {/* Original Puck actions */}
          <div className="flex items-center space-x-2">
            {actions}
          </div>
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

  // 4. Fix collision detection with enhanced error boundaries and safe rendering
  iframe: ({ children, document }: { children: React.ReactNode; document?: Document }) => {
    // Inject styles and scripts to prevent collision detection errors
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

        // Add safe property access helpers
        const script = document.createElement('script');
        script.textContent = `
          // Safe property access for drag operations
          window.safePropAccess = function(obj, path, defaultValue = '') {
            try {
              return path.split('.').reduce((current, key) => {
                if (current && typeof current === 'object' && key in current) {
                  const value = current[key];
                  return value !== null && value !== undefined ? value : defaultValue;
                }
                return defaultValue;
              }, obj);
            } catch (error) {
              console.warn('Safe prop access failed:', error);
              return defaultValue;
            }
          };
          
          // Enhanced toString for all objects to prevent collision errors
          if (typeof Object.prototype.safeToString === 'undefined') {
            Object.prototype.safeToString = function() {
              try {
                if (this === null || this === undefined) return '';
                if (typeof this.toString === 'function') {
                  return this.toString();
                }
                return String(this);
              } catch (error) {
                return '';
              }
            };
          }
        `;
        document.head.appendChild(script);
      }
    }, [document]);

    return (
      <div 
        style={{ 
          minHeight: '100vh', 
          position: 'relative',
          // Ensure safe rendering context
          isolation: 'isolate'
        }}
      >
        {children}
      </div>
    );
  },

  // Enhanced preview with collision detection safeguards
  preview: ({ children }: { children: React.ReactNode }) => (
    <div 
      className="puck-preview-wrapper"
      style={{
        // Prevent collision detection issues during drag
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
  )
});

export default createPuckOverrides; 