import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Globe, GlobeLock, Settings, Menu, Eye, Palette, FileText, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import PuckOnlyEditor from '@/components/pagebuilder/puck/PuckOnlyEditor';
import MobilePuckEditor from '@/components/pagebuilder/puck/MobilePuckEditor';
import { safeCastToPuckData } from '@/components/pagebuilder/utils/puckDataHelpers';
import SidebarContainer from '@/components/pagebuilder/sidebar/SidebarContainer';
import { PageBuilderProvider } from '@/components/pagebuilder/context/PageBuilderContext';

interface ConsolidatedPageBuilderLayoutProps {
  pageTitle: string;
  pageContent: any;
  isPublished: boolean;
  isHomepage: boolean;
  organizationId: string;
  isSaving: boolean;
  isDirty: boolean;
  isMobile: boolean;
  isSubdomainAccess: boolean;
  onContentChange: (content: any) => void;
  onTitleChange: (title: string) => void;
  onHomepageChange: (isHomepage: boolean) => void;
  onSave: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onBackToDashboard: () => void;
  onPreview: (live: boolean) => void;
}

const ConsolidatedPageBuilderLayout: React.FC<ConsolidatedPageBuilderLayoutProps> = ({
  pageTitle,
  pageContent,
  isPublished,
  isHomepage,
  organizationId,
  isSaving,
  isDirty,
  isMobile,
  isSubdomainAccess,
  onContentChange,
  onTitleChange,
  onHomepageChange,
  onSave,
  onPublish,
  onUnpublish,
  onBackToDashboard,
  onPreview
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Fix back button navigation to go to dashboard
  const handleBackToDashboard = () => {
    console.log('ConsolidatedPageBuilderLayout: Back button clicked', {
      isSubdomainAccess,
      organizationId
    });
    
    // Always go to dashboard, not landing page
    if (isSubdomainAccess) {
      // For subdomain access, go to root which shows the dashboard
      window.location.href = '/dashboard';
    } else if (organizationId) {
      // For main domain with organization, go to organization dashboard
      window.location.href = `/dashboard/${organizationId}`;
    } else {
      // Fallback to main dashboard
      window.location.href = '/dashboard?admin=true';
    }
  };

  // Ensure we have valid pageContent for the editor with proper validation
  const editorContent = safeCastToPuckData(pageContent);
  const hasValidContent = editorContent && (editorContent.content?.length > 0 || Object.keys(editorContent.root || {}).length > 0);

  return (
    <PageBuilderProvider initialPageData={null}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Enhanced Header */}
          <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
            <div className="px-4 py-3 flex items-center justify-between">
              {/* Left Section */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleBackToDashboard}
                      className="flex items-center gap-2 flex-shrink-0"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      {!isMobile && <span>Dashboard</span>}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Return to dashboard</p>
                  </TooltipContent>
                </Tooltip>
                
                {isMobile && (
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
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-xl font-semibold truncate">
                      {pageTitle || 'Untitled Page'}
                    </h1>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isPublished ? (
                        <Badge variant="default" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          Live
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 text-xs">
                          <GlobeLock className="h-3 w-3 mr-1" />
                          Draft
                        </Badge>
                      )}
                      {isDirty && (
                        <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 text-xs">
                          Unsaved
                        </Badge>
                      )}
                    </div>
                  </div>
                  {isSaving && (
                    <div className="flex items-center gap-2 mt-1 text-blue-600">
                      <div className="h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">Saving changes...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onPreview(true)}
                      disabled={isSaving || !pageContent || !pageTitle}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      {!isMobile && <span>Preview</span>}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Preview your page</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onSave}
                      disabled={!isDirty || isSaving}
                      className="flex items-center gap-1 relative"
                    >
                      {isSaving ? (
                        <div className="h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {!isMobile && <span>{isSaving ? 'Saving...' : 'Save'}</span>}
                      {isDirty && !isSaving && (
                        <div className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full"></div>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isDirty ? 'Save your changes' : 'No changes to save'}</p>
                  </TooltipContent>
                </Tooltip>

                {isPublished ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onUnpublish}
                        disabled={isSaving}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      >
                        <GlobeLock className="h-4 w-4" />
                        {!isMobile && <span>Unpublish</span>}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Make page private</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        onClick={onPublish}
                        disabled={isSaving || !pageTitle}
                        className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Globe className="h-4 w-4" />
                        {!isMobile && <span>Publish</span>}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Make page live</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex h-[calc(100vh-73px)]">
            {/* Enhanced Sidebar with Pages Tab */}
            {!isMobile && (
              <div className={`bg-white border-r border-gray-200 flex-shrink-0 shadow-sm transition-all duration-300 ${
                sidebarCollapsed ? 'w-16' : 'w-72 xl:w-80'
              }`}>
                <SidebarContainer />
              </div>
            )}

            {/* Editor */}
            <div className="flex-1 min-w-0 bg-gray-50 relative overflow-hidden">
              <div className="h-full w-full">
                <PuckOnlyEditor
                  initialData={pageContent}
                  onSave={onSave}
                  onChange={onContentChange}
                  organizationId={organizationId}
                  mode="edit"
                />
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </PageBuilderProvider>
  );
};

export default ConsolidatedPageBuilderLayout;
