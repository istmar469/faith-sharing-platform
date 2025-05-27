
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Globe, GlobeLock, Settings, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import PuckOnlyEditor from '@/components/pagebuilder/puck/PuckOnlyEditor';
import MobilePuckEditor from '@/components/pagebuilder/puck/MobilePuckEditor';

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
  onBackToDashboard
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const PageSettings = () => (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Page Settings</h3>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Page Title</Label>
            <Input
              id="title"
              value={pageTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Enter page title..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Page Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Set as Homepage</Label>
              <p className="text-sm text-gray-500">Make this the main page of your site</p>
            </div>
            <Switch
              checked={isHomepage}
              onCheckedChange={onHomepageChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBackToDashboard}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
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
            
            <div>
              <h1 className="text-xl font-semibold">{pageTitle}</h1>
              <div className="flex items-center gap-2">
                {isPublished ? (
                  <>
                    <Globe className="h-4 w-4 text-green-500" />
                    <Badge variant="default" className="bg-green-100 text-green-700">Published</Badge>
                  </>
                ) : (
                  <>
                    <GlobeLock className="h-4 w-4 text-gray-500" />
                    <Badge variant="outline">Draft</Badge>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSave}
              disabled={!isDirty || isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>

            {isPublished ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={onUnpublish}
                disabled={isSaving}
              >
                <GlobeLock className="h-4 w-4 mr-2" />
                Unpublish
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={onPublish}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                <Globe className="h-4 w-4 mr-2" />
                Publish
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            <PageSettings />
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 bg-white">
          {isMobile ? (
            <MobilePuckEditor
              initialData={pageContent}
              onChange={onContentChange}
              organizationId={organizationId}
              mode="edit"
            />
          ) : (
            <PuckOnlyEditor
              initialData={pageContent}
              onChange={onContentChange}
              organizationId={organizationId}
              mode="edit"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsolidatedPageBuilderLayout;
