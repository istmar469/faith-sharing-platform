
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
    <div className="lg:col-span-1">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Page Settings</h3>
        
        <div className="space-y-2">
          <Label htmlFor="title">Page Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter page title..."
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="published">Published</Label>
          <Switch
            id="published"
            checked={published}
            onCheckedChange={onPublishedChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="homepage">Homepage</Label>
          <Switch
            id="homepage"
            checked={isHomepage}
            onCheckedChange={onHomepageChange}
          />
        </div>

        {pageData?.id && (
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500">
              Page ID: {pageData.id}
            </p>
            {pageData.updated_at && (
              <p className="text-xs text-gray-500">
                Last saved: {new Date(pageData.updated_at).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageBuilderSidebar;
