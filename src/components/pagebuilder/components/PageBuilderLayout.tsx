import React from 'react';
import { useLayoutSettings } from '@/hooks/useLayoutSettings';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import PageSideNav from '../PageSideNav';
import PageHeader from '../PageHeader';
import PageCanvas from '../PageCanvas';
import SidebarContainer from '../sidebar/SidebarContainer';
import RightSettingsPanel from '../sidebar/RightSettingsPanel';
import DebugPanel from '../preview/DebugPanel';
import TemplatePromptBar from './TemplatePromptBar';
import { PluginSystemProvider } from '@/components/dashboard/PluginSystemProvider';
import { Badge } from '@/components/ui/badge';
import { Globe, ArrowLeft, Save, GlobeLock, Menu, X, Settings, Palette, Layout, Eye, Edit, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
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
  const { siteSettings } = useSiteSettings(organizationId);
  const { getContainerClasses, getContentClasses, isFullWidth, isBoxed, isWide } = useLayoutSettings(
    siteSettings,
    { content_width: 'boxed' } // Override for page builder - usually want boxed for editing
  );
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
  const [layoutMode, setLayoutMode] = React.useState<'boxed' | 'full-width' | 'wide'>('boxed');
  const [previewMode, setPreviewMode] = React.useState(false);
  
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
  
  const handleSavePage = async () => {
    try {
      await savePage();
      toast.success("Page saved successfully!");
    } catch (err) {
      toast.error("Failed to save page");
      console.error("Error saving page:", err);
    }
  };
  
  const handlePublish = async () => {
    if (publishing) return;
    
    setPublishing(true);
    try {
      await savePage();
      setIsPublished(true);
      toast.success("Page published successfully!");
    } catch (err) {
      toast.error("Failed to publish page");
      console.error("Error publishing page:", err);
    } finally {
      setPublishing(false);
    }
  };
  
  const handleUnpublish = async () => {
    if (publishing) return;
    
    setPublishing(true);
    try {
      setIsPublished(false);
      await savePage();
      toast.success("Page unpublished successfully!");
    } catch (err) {
      toast.error("Failed to unpublish page");
      console.error("Error unpublishing page:", err);
    } finally {
      setPublishing(false);
    }
  };

  const handlePreviewToggle = async () => {
    if (!previewMode) {
      // Entering preview mode - save first if there are changes
      if (isDirty) {
        try {
          await savePage();
          toast.success("Page saved before preview");
        } catch (err) {
          toast.error("Failed to save page before preview");
          return;
        }
      }
      
      if (!pageData?.slug && !pageData?.id) {
        toast.error("Cannot preview: Page needs to be saved first");
        return;
      }
      
      // Navigate to clean URL without preview parameters
      if (pageData?.slug) {
        // Use clean URL navigation - just the slug
        window.location.href = `/${pageData.slug}`;
      } else {
        // For pages without slugs, show local preview mode
        setPreviewMode(true);
        toast.info("Preview mode: This is how your page will look when published");
      }
    } else {
      // Exiting preview mode - just toggle back to edit
      setPreviewMode(false);
    }
  };
  
  const toggleLayoutMode = () => {
    const modes: ('boxed' | 'full-width' | 'wide')[] = ['boxed', 'wide', 'full-width'];
    const currentIndex = modes.indexOf(layoutMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setLayoutMode(modes[nextIndex]);
  };
  
  const getCanvasContainerClasses = () => {
    switch (layoutMode) {
      case 'full-width':
        return 'w-full min-h-screen';
      case 'wide':
        return 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
      case 'boxed':
      default:
        return 'w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8';
    }
  };

  // If in preview mode, render the page content without editor UI
  if (previewMode) {
    return (
      <div className="min-h-screen bg-white">
        {/* Admin Preview Overlay */}
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white px-4 py-2 shadow-lg z-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">Preview Mode</span>
            <span className="text-xs bg-blue-500 px-2 py-1 rounded">
              This is how your page will appear to visitors
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm"
              variant="secondary"
              onClick={() => setPreviewMode(false)}
              className="flex items-center gap-1 bg-white text-blue-600 hover:bg-gray-100"
            >
              <Edit className="h-3 w-3" />
              Back to Editor
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="pt-12">
          <PageCanvas />
        </div>
      </div>
    );
  }
  
  return (
    <PluginSystemProvider>
      <div className="h-screen flex flex-col bg-white">
        {/* Template Prompt Bar */}
        {showTemplatePrompt && (
          <TemplatePromptBar />
        )}
        
        {/* Enhanced Header with Layout Controls */}
        <div className="bg-white border-b border-gray-200 shadow-sm z-10">
          <div className="px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Back button and title */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBackToDashboard}
                  className="flex items-center gap-2 shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {isMobile ? '' : 'Back'}
                </Button>
                
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                    {pageTitle || 'Page Builder'}
                  </h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {organizationId && (
                      <Badge variant="outline" className="text-xs">
                        {isActuallySubdomain ? 'Subdomain' : 'Org'}: {organizationId.slice(0, 8)}...
                      </Badge>
                    )}
                    
                    {/* Layout Mode Badge */}
                    <Badge 
                      variant="secondary" 
                      className="text-xs cursor-pointer hover:bg-gray-200 transition-colors"
                      onClick={toggleLayoutMode}
                    >
                      <Layout className="h-3 w-3 mr-1" />
                      {layoutMode === 'boxed' ? 'Boxed' : layoutMode === 'wide' ? 'Wide' : 'Full Width'}
                    </Badge>
                    
                    {/* Page Status */}
                    <div className="flex items-center gap-1">
                      {isPublished ? (
                        <>
                          <Globe className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-600">Published</span>
                        </>
                      ) : (
                        <>
                          <GlobeLock className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">Draft</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Mobile Sidebar Toggle */}
                {isTablet && (
                  <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Menu className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 p-0">
                      <SidebarContainer />
                    </SheetContent>
                  </Sheet>
                )}

                {/* Preview Button */}
                <Button 
                  onClick={handlePreviewToggle}
                  disabled={isSaving || (!pageData?.id && !isDirty)}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  {!isMobile && <span>Preview</span>}
                </Button>

                {/* Save Button */}
                <Button 
                  onClick={handleSavePage}
                  disabled={isSaving}
                  size="sm"
                  variant="outline"
                  className="hidden sm:flex"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>

                {/* Publish/Unpublish Button */}
                <Button 
                  onClick={isPublished ? handleUnpublish : handlePublish}
                  disabled={publishing}
                  size="sm"
                  className={isPublished ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {publishing ? 'Working...' : isPublished ? 'Unpublish' : 'Publish'}
                </Button>

                {/* Settings Panel Toggle (Large screens only) */}
                {isLargeScreen && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSettingsOpen(!settingsOpen)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Sidebar - Conditionally visible based on layout mode */}
          {layoutMode !== 'full-width' && (
            <div className="w-72 lg:w-80 xl:w-84 transition-all duration-300 border-r border-gray-200 bg-white flex-shrink-0 overflow-hidden shadow-sm">
              <SidebarContainer />
            </div>
          )}
          
          {/* Main Canvas - Enhanced with true responsive layout options */}
          <div className="flex-1 min-w-0 bg-gray-50 relative">
            <div className="h-full overflow-auto">
              <div className={`${getCanvasContainerClasses()} ${layoutMode === 'full-width' ? 'p-0' : 'py-3 sm:py-4 lg:py-6 xl:py-8'} transition-all duration-300`}>
                <div className={`bg-white ${layoutMode === 'full-width' ? 'min-h-screen' : 'rounded-lg shadow-sm border border-gray-200 min-h-[600px]'} relative overflow-hidden`}>
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
          
          {/* Right Settings Panel - Only show in boxed/wide modes */}
          {isLargeScreen && settingsOpen && layoutMode !== 'full-width' && (
            <div className="w-80 xl:w-84 border-l border-gray-200 bg-white flex-shrink-0 shadow-sm">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Settings className="h-4 w-4 text-purple-500" />
                      Settings
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Customize selected component</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSettingsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <RightSettingsPanel />
                </div>
              </div>
            </div>
          )}

          {/* Floating sidebar toggle for full-width mode */}
          {layoutMode === 'full-width' && (
            <div className="fixed top-20 left-4 z-40">
              <Button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                variant="secondary"
                size="sm"
                className="shadow-lg"
              >
                {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              </Button>
              
              {sidebarOpen && (
                <div className="mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-hidden">
                  <SidebarContainer />
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Enhanced Debug Panel */}
        {debugMode && (
          <DebugPanel 
            organizationId={organizationId}
            pageData={pageData}
          />
        )}

        {/* Mobile Action Bar */}
        {isMobile && (
          <div className="border-t border-gray-200 bg-white p-3 flex justify-center gap-2">
            <Button 
              onClick={handleSavePage}
              disabled={isSaving}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button 
              onClick={isPublished ? handleUnpublish : handlePublish}
              disabled={publishing}
              size="sm"
              className={`flex-1 ${isPublished ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              <Globe className="h-4 w-4 mr-2" />
              {publishing ? 'Working...' : isPublished ? 'Unpublish' : 'Publish'}
            </Button>
          </div>
        )}
      </div>
    </PluginSystemProvider>
  );
};

export default PageBuilderLayout;
