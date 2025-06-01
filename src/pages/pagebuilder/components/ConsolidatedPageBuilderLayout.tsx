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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const PageSettings = () => (
    <div className="h-full flex flex-col">
      {/* Settings Header */}
      <div className="p-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="h-4 w-4 text-blue-500" />
          <h2 className="font-semibold text-gray-900">Page Settings</h2>
        </div>
        <p className="text-xs text-gray-500">Configure your page properties</p>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {/* Page Title Section */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              Page Title
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Input
              id="title"
              value={pageTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Enter page title..."
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-2">
              This will be displayed in browser tabs and search results
            </p>
          </CardContent>
        </Card>

        {/* Page Options */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-500" />
              Page Options
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {/* Homepage Setting */}
            <div className="flex items-start justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex-1 min-w-0">
                <Label htmlFor="isHomepageSwitch" className="font-medium text-sm text-gray-900">
                  Set as Homepage
                </Label>
                <p className="text-xs text-gray-600 mt-1">
                  Make this the main landing page for your website
                </p>
              </div>
              <Switch
                id="isHomepageSwitch"
                checked={isHomepage}
                onCheckedChange={onHomepageChange}
                className="ml-3 flex-shrink-0"
              />
            </div>

            {/* SEO Preview */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-xs font-medium text-blue-900 mb-2">SEO Preview</h4>
              <div className="text-xs">
                <div className="text-blue-600 font-medium truncate">
                  {pageTitle || 'Untitled Page'}
                </div>
                <div className="text-green-600 text-xs mt-1">
                  yoursite.com/{pageTitle?.toLowerCase().replace(/\s+/g, '-') || 'untitled'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Publishing Status */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-500" />
              Publishing Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`p-3 rounded-lg border ${
              isPublished 
                ? 'bg-emerald-50 border-emerald-200' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {isPublished ? (
                  <>
                    <Globe className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-900">Published</span>
                  </>
                ) : (
                  <>
                    <GlobeLock className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-900">Draft</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-600">
                {isPublished 
                  ? 'This page is live and visible to visitors'
                  : 'This page is in draft mode and not visible to visitors'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Ensure we have valid pageContent for the editor with proper validation
  const editorContent = safeCastToPuckData(pageContent);
  const hasValidContent = editorContent && (editorContent.content?.length > 0 || Object.keys(editorContent.root || {}).length > 0);

  return (
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
                    onClick={onBackToDashboard}
                    className="flex items-center gap-2 flex-shrink-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {!isMobile && <span>Back</span>}
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
                    <PageSettings />
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
          {/* Desktop Sidebar */}
          {!isMobile && (
            <div className={`bg-white border-r border-gray-200 flex-shrink-0 shadow-sm transition-all duration-300 ${
              sidebarCollapsed ? 'w-12' : 'w-72 xl:w-80'
            }`}>
              {/* Sidebar Header with Collapse Toggle */}
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
                {!sidebarCollapsed && (
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-500" />
                    <h2 className="font-semibold text-gray-900 text-sm">Page Settings</h2>
                  </div>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={toggleSidebar}
                      className={`h-8 w-8 rounded-md p-0 hover:bg-gray-200 transition-colors ${
                        sidebarCollapsed && 'mx-auto'
                      }`}
                    >
                      {sidebarCollapsed ? (
                        <PanelLeftOpen className="h-4 w-4 text-gray-600" />
                      ) : (
                        <PanelLeftClose className="h-4 w-4 text-gray-600" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={sidebarCollapsed ? "right" : "bottom"}>
                    {sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Sidebar Content */}
              {!sidebarCollapsed && (
                <div className="h-[calc(100%-60px)] overflow-y-auto">
                  <PageSettings />
                </div>
              )}
            </div>
          )}

          {/* Editor - Fixed container and removed loading states that were interfering */}
          <div className="flex-1 min-w-0 bg-gray-50 relative">
            <div className="h-full">
              <div className="h-full p-3 sm:p-4 lg:p-6 xl:p-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full relative overflow-hidden">
                  {/* Render editor without interfering loading states */}
                  <div className="h-full w-full">
                    {isMobile ? (
                      <MobilePuckEditor
                        initialData={editorContent}
                        onChange={onContentChange}
                        organizationId={organizationId}
                        mode="edit"
                      />
                    ) : (
                      <PuckOnlyEditor
                        initialData={editorContent}
                        onChange={onContentChange}
                        organizationId={organizationId}
                        mode="edit"
                      />
                    )}
                  </div>
                  
                  {/* Only show loading overlay during actual save operations */}
                  {isSaving && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 flex flex-col items-center gap-3 max-w-sm mx-4">
                        <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">Saving your changes</p>
                          <p className="text-xs text-gray-500 mt-1">Please wait while we save your work</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Show empty state only when there's truly no content */}
                  {!hasValidContent && !isSaving && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
                      <div className="text-center p-8 max-w-md">
                        <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building</h3>
                        <p className="text-gray-500 text-sm">
                          {isMobile 
                            ? "Open the sidebar to add components to your page"
                            : "Drag components from the sidebar to start building your page"
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ConsolidatedPageBuilderLayout;
