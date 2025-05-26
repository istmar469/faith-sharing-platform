
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { usePageBuilder } from '../context/PageBuilderContext';

const SettingsSidebar: React.FC = () => {
  const { 
    pageTitle,
    setPageTitle,
    isPublished,
    setIsPublished,
    pageSlug,
    setPageSlug,
    metaTitle,
    setMetaTitle
  } = usePageBuilder();

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-semibold text-gray-900">Page Settings</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Page Title</Label>
          <Input
            id="title"
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            placeholder="Enter page title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Page Slug</Label>
          <Input
            id="slug"
            value={pageSlug}
            onChange={(e) => setPageSlug(e.target.value)}
            placeholder="page-url-slug"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="meta-title">Meta Title</Label>
          <Input
            id="meta-title"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="SEO title"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="published">Published</Label>
          <Switch
            id="published"
            checked={isPublished}
            onCheckedChange={setIsPublished}
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsSidebar;
