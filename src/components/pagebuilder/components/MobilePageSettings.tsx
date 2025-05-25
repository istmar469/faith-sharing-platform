
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PageData } from '@/services/pageService';

interface MobilePageSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  published: boolean;
  isHomepage: boolean;
  pageData: PageData | null;
  onTitleChange: (title: string) => void;
  onPublishedChange: (published: boolean) => void;
  onHomepageChange: (isHomepage: boolean) => void;
}

const MobilePageSettings: React.FC<MobilePageSettingsProps> = ({
  open,
  onOpenChange,
  title,
  published,
  isHomepage,
  pageData,
  onTitleChange,
  onPublishedChange,
  onHomepageChange
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh] rounded-t-lg">
        <SheetHeader>
          <SheetTitle>Page Settings</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="mobile-title">Page Title</Label>
            <Input
              id="mobile-title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Enter page title..."
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor="mobile-published" className="text-sm font-medium">
                Published
              </Label>
              <p className="text-xs text-gray-500">Make this page visible to visitors</p>
            </div>
            <Switch
              id="mobile-published"
              checked={published}
              onCheckedChange={onPublishedChange}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor="mobile-homepage" className="text-sm font-medium">
                Homepage
              </Label>
              <p className="text-xs text-gray-500">Set as the main page of your site</p>
            </div>
            <Switch
              id="mobile-homepage"
              checked={isHomepage}
              onCheckedChange={onHomepageChange}
            />
          </div>

          {pageData?.id && (
            <div className="pt-4 border-t border-gray-100">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">
                  Page ID: {pageData.id}
                </p>
                {pageData.updated_at && (
                  <p className="text-xs text-gray-500">
                    Last saved: {new Date(pageData.updated_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobilePageSettings;
