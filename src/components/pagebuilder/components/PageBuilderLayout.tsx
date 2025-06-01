import React from 'react';
import PageSideNav from '../PageSideNav';
import PageHeader from '../PageHeader';
import PageCanvas from '../PageCanvas';
import SidebarContainer from '../sidebar/SidebarContainer';
import RightSettingsPanel from '../sidebar/RightSettingsPanel';
import DebugPanel from '../preview/DebugPanel';
import TemplatePromptBar from './TemplatePromptBar';
import { PluginSystemProvider } from '@/components/dashboard/PluginSystemProvider';
import { Badge } from '@/components/ui/badge';
import { Globe, ArrowLeft, Save, GlobeLock, Menu, X, Settings, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { usePageBuilder } from '../context/PageBuilderContext';
import { useTenantContext } from '@/components/context/TenantContext';
import { useMediaQuery } from '@/hooks/use-media-query';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface PageBuilderLayoutProps {
  isSuperAdmin: boolean;
  organizationId: string | null;
  pageData: any;
  showTemplatePrompt: boolean;
  debugMode: boolean;
  subdomain?: string | null;
  isSubdomainAccess?: boolean;
}

const PageBuilderLayout: React.FC<PageBuilderLayoutProps> = ({
  isSuperAdmin,
  organizationId,
  pageData,
  showTemplatePrompt,
  debugMode,
  subdomain,
  isSubdomainAccess = false
}) => {
  const navigate = useNavigate();
  const { isSubdomainAccess: contextSubdomain } = useTenantContext();
  const isLargeScreen = useMediaQuery("(min-width: 1440px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { 
    savePage, 
    isSaving, 
    pageTitle, 
    setIsPublished, 
    isPublished,
    pageElements 
  } = usePageBuilder();
  
  const [publishing, setPublishing] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  
  // Use context value for subdomain access
  const isActuallySubdomain = contextSubdomain || isSubdomainAccess;
  
  // Check if there are unsaved changes - use content array for Puck format
  const isDirty = pageElements && pageElements.content && pageElements.content.length > 0;
  
  const handleBackToDashboard = async () => {
    console.log("PageBuilderLayout: Navigating back to dashboard", {
      isActuallySubdomain,
      organizationId,
      subdomain
    });
    
    // Save changes before navigating
    try {
      if (isDirty) {
        await savePage();
        toast.success("Changes saved successfully!");
      }
      
      // Navigate back to appropriate dashboard
      if (isActuallySubdomain) {
        console.log("Navigating to subdomain dashboard");
        navigate('/');
      } else {
        console.log("Navigating to main dashboard");
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error("Failed to save changes before navigating");
      console.error("Error saving before navigation:", err);
    }
  };
  
  const handlePublish = async () => {
    try {
      setPublishing(true);
      setIsPublished(true);
      await savePage();
      toast.success("Page published successfully!");
    } catch (err) {
      toast.error("Failed to publish page");
      console.error("Error publishing page:", err);
      setIsPublished(false);
    } finally {
      setPublishing(false);
    }
  };
  
  return (
    <PluginSystemProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Enhanced Header Bar */}
        <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0 relative z-50">
          <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-3">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Button 
                variant="outline" 
                size={isMobile ? "sm" : "default"}
                onClick={handleBackToDashboard}
                className="flex items-center gap-2 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              
              {/* Mobile Sidebar Toggle */}
              {isTablet && (
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size={isMobile ? "sm" : "default"}>
                      <Menu className="h-4 w-4" />
                      <span className="hidden sm:inline ml-2">Components</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <div className="h-full overflow-y-auto">
                      <SidebarContainer />
                    </div>
                  </SheetContent>
                </Sheet>
              )}
              
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold truncate">
                  {pageTitle || 'Page Builder'}
                </h1>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isPublished ? (
                    <>
                      <Globe className="h-4 w-4 text-emerald-500" />
                      <Badge variant="default" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                        Live
                      </Badge>
                    </>
                  ) : (
                    <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 bg-amber-50">
                      Draft
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {isSaving && (
                <div className="flex items-center gap-2 text-blue-600 mr-2">
                  <div className="h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs hidden sm:inline">Saving...</span>
                </div>
              )}
              
              {/* Mobile Settings Toggle */}
              {isMobile && isLargeScreen && (
                <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80 p-0">
                    <RightSettingsPanel />
                  </SheetContent>
                </Sheet>
              )}
              
              <Button 
                onClick={savePage} 
                size={isMobile ? "sm" : "default"}
                disabled={isSaving}
                variant="outline"
                className="flex items-center gap-1 relative"
              >
                {isSaving ? (
                  <div className="h-3 w-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
                <span className="hidden sm:inline">Save</span>
                {isDirty && !isSaving && (
                  <div className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full"></div>
                )}
              </Button>
              
              <Button 
                onClick={handlePublish} 
                size={isMobile ? "sm" : "default"}
                disabled={publishing}
                variant={isPublished ? "outline" : "default"}
                className={`flex items-center gap-1 ${
                  !isPublished ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
                }`}
              >
                {publishing ? (
                  <div className="h-3 w-3 border border-current border-t-transparent rounded-full animate-spin" />
                ) : isPublished ? (
                  <GlobeLock className="h-3 w-3" />
                ) : (
                  <Globe className="h-3 w-3" />
                )}
                <span className="hidden sm:inline">
                  {isPublished ? 'Unpublish' : 'Publish'}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Template Prompt with improved styling */}
        {showTemplatePrompt && (
          <div className="border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <TemplatePromptBar />
          </div>
        )}
        
        {/* Main Content Area with better layout */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Sidebar - Enhanced responsive behavior */}
          <div className={`${
            isTablet ? 'hidden' : 'w-72 lg:w-80 xl:w-84'
          } transition-all duration-300 border-r border-gray-200 bg-white flex-shrink-0 overflow-hidden shadow-sm`}>
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Palette className="h-4 w-4 text-blue-500" />
                  Components
                </h2>
                <p className="text-xs text-gray-500 mt-1">Drag components to build your page</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarContainer />
              </div>
            </div>
          </div>
          
          {/* Main Canvas - Enhanced with better spacing and responsiveness */}
          <div className="flex-1 min-w-0 bg-gray-50 relative">
            <div className="h-full overflow-auto">
              <div className="max-w-6xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px] relative overflow-hidden">
                  <PageCanvas />
                  
                  {/* Loading overlay */}
                  {isSaving && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                      <div className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-3">
                        <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium text-gray-700">Saving changes...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Settings Panel - Enhanced for larger screens */}
          {isLargeScreen && !isTablet && (
            <div className="w-80 xl:w-84 border-l border-gray-200 bg-white flex-shrink-0 shadow-sm">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-purple-500" />
                    Settings
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Customize selected component</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <RightSettingsPanel />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Enhanced Debug Panel */}
        {debugMode && organizationId && (
          <div className="border-t border-gray-200 bg-gray-900 text-white">
            <DebugPanel organizationId={organizationId} pageData={pageData} />
          </div>
        )}
      </div>
    </PluginSystemProvider>
  );
};

export default PageBuilderLayout;
