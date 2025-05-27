
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PageData } from '@/services/pageService';

interface PageBuilderSidebarProps {
  title: string;
  published: boolean;
  isHomepage: boolean;
  pageData: PageData | null;
  onTitleChange: (title: string) => void;
  onPublishedChange: (published: boolean) => void;
  onHomepageChange: (isHomepage: boolean) => void;
}

const PageBuilderSidebar: React.FC<PageBuilderSidebarProps> = ({
  title,
  published,
  isHomepage,
  pageData,
  onTitleChange,
  onPublishedChange,
  onHomepageChange
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Page Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Configure your page properties</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Basic Settings */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Page Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="Enter page title..."
                  className="w-full h-10"
                />
                <p className="text-xs text-gray-500">
                  This will be displayed in the browser tab and search results
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Visibility Settings */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Visibility & Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <Label htmlFor="published" className="text-sm font-medium">
                    Published
                  </Label>
                  <p className="text-xs text-gray-500">
                    Make this page visible to visitors
                  </p>
                </div>
                <Switch
                  id="published"
                  checked={published}
                  onCheckedChange={onPublishedChange}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <Label htmlFor="homepage" className="text-sm font-medium">
                    Set as Homepage
                  </Label>
                  <p className="text-xs text-gray-500">
                    Make this the main page of your site
                  </p>
                </div>
                <Switch
                  id="homepage"
                  checked={isHomepage}
                  onCheckedChange={onHomepageChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Page Status */}
          {pageData && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Page Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pageData.id && (
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-500">Page ID</Label>
                    <p className="text-sm font-mono bg-gray-50 p-2 rounded border text-gray-700">
                      {pageData.id}
                    </p>
                  </div>
                )}
                
                {pageData.updated_at && (
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-500">Last Updated</Label>
                    <p className="text-sm text-gray-700">
                      {new Date(pageData.updated_at).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-500">Status</Label>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${published ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-sm text-gray-700">
                      {published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PageBuilderSidebar;
