
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { usePageBuilder } from '../context/PageBuilderContext';
import { Save, Eye, Globe } from 'lucide-react';

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

  const handleSave = () => {
    // This will be handled by the page builder logic
    console.log('Save triggered from settings panel');
  };

  const handlePreview = () => {
    // This will be handled by the page builder logic
    console.log('Preview triggered from settings panel');
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setPageTitle(value);
    // Auto-generate slug if it's empty or matches the old title pattern
    if (!pageSlug || pageSlug === generateSlug(pageTitle)) {
      setPageSlug(generateSlug(value));
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto h-full">
      <div className="space-y-6">
        {/* Page Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Page Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleSave} className="w-full" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Page
            </Button>
            <Button onClick={handlePreview} variant="outline" className="w-full" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </CardContent>
        </Card>

        {/* Basic Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Basic Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="page-title">Page Title</Label>
              <Input
                id="page-title"
                value={pageTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter page title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="page-slug">URL Slug</Label>
              <Input
                id="page-slug"
                value={pageSlug}
                onChange={(e) => setPageSlug(e.target.value)}
                placeholder="page-url-slug"
              />
              <p className="text-xs text-gray-500">
                This page will be available at: /{pageSlug}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SEO Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">SEO Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meta-title">Meta Title</Label>
              <Input
                id="meta-title"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="SEO title (optional)"
              />
              <p className="text-xs text-gray-500">
                Displayed in search results and browser tabs
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta-description">Meta Description</Label>
              <Textarea
                id="meta-description"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Brief description for search engines"
                rows={3}
              />
              <p className="text-xs text-gray-500">
                Shown in search results. Keep under 160 characters.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Page Visibility */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Page Visibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="published">Published</Label>
                <p className="text-xs text-gray-500">
                  Make this page visible to visitors
                </p>
              </div>
              <Switch
                id="published"
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-navigation">Show in Navigation</Label>
                <p className="text-xs text-gray-500">
                  Include in the site navigation menu
                </p>
              </div>
              <Switch
                id="show-navigation"
                checked={showInNavigation}
                onCheckedChange={setShowInNavigation}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="homepage">Set as Homepage</Label>
                <p className="text-xs text-gray-500">
                  Make this the main page of your site
                </p>
              </div>
              <Switch
                id="homepage"
                checked={isHomepage}
                onCheckedChange={setIsHomepage}
              />
            </div>
          </CardContent>
        </Card>

        {/* Page Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Page Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Globe className={`h-4 w-4 ${isPublished ? 'text-green-500' : 'text-gray-400'}`} />
              <span className={`text-sm ${isPublished ? 'text-green-600' : 'text-gray-500'}`}>
                {isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
            {isHomepage && (
              <div className="mt-2 text-xs text-blue-600">
                This is your homepage
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RightSettingsPanel;
