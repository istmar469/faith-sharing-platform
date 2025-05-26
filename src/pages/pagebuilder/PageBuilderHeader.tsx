
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye, Globe, GlobeLock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface PageBuilderHeaderProps {
  organizationId: string | null;
  isSubdomainAccess: boolean;
  title: string;
  published: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  onSave: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onPreview: () => void;
  onBackToDashboard: () => void;
}

const PageBuilderHeader: React.FC<PageBuilderHeaderProps> = ({
  organizationId,
  isSubdomainAccess,
  title,
  published,
  isSaving,
  isPublishing,
  onSave,
  onPublish,
  onUnpublish,
  onPreview,
  onBackToDashboard
}) => {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBackToDashboard}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {title || 'Page Builder'}
              </h1>
              <p className="text-sm text-gray-500">
                {isSubdomainAccess ? 'Subdomain Editor' : 'Organization Editor'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Page Status */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100">
              {published ? (
                <>
                  <Globe className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">Published</span>
                </>
              ) : (
                <>
                  <GlobeLock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500 font-medium">Draft</span>
                </>
              )}
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Action Buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={onPreview}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>

            {published ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={onUnpublish}
                disabled={isPublishing}
                className="flex items-center gap-2"
              >
                <GlobeLock className="h-4 w-4" />
                {isPublishing ? 'Unpublishing...' : 'Unpublish'}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={onPublish}
                disabled={isPublishing}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Globe className="h-4 w-4" />
                {isPublishing ? 'Publishing...' : 'Publish'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageBuilderHeader;
