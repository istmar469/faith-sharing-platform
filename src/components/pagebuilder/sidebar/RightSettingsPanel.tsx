
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { usePageBuilder } from '../context/PageBuilderContext';

const RightSettingsPanel: React.FC = () => {
  const { 
    pageTitle,
    setPageTitle,
    isPublished,
    setIsPublished,
    pageSlug,
    setPageSlug,
    metaTitle,
    setMetaTitle,
    metaDescription,
    setMetaDescription,
    showInNavigation,
    setShowInNavigation,
    isHomepage,
    setIsHomepage
  } = usePageBuilder();

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <h3 className="font-semibold text-gray-900 mb-4">Page Settings</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="page-title">Page Title</Label>
          <Input
            id="page-title"
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            placeholder="Enter page title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="page-slug">Page Slug</Label>
          <Input
            id="page-slug"
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

        <div className="space-y-2">
          <Label htmlFor="meta-description">Meta Description</Label>
          <Textarea
            id="meta-description"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="SEO description"
            rows={3}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="published">Published</Label>
            <Switch
              id="published"
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-navigation">Show in Navigation</Label>
            <Switch
              id="show-navigation"
              checked={showInNavigation}
              onCheckedChange={setShowInNavigation}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="homepage">Set as Homepage</Label>
            <Switch
              id="homepage"
              checked={isHomepage}
              onCheckedChange={setIsHomepage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSettingsPanel;
