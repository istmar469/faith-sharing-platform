
import React, { useState } from 'react';
import { ArrowLeft, Save, Eye, Menu, X, Settings, Check, Globe, GlobeLock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import OrgAwareLink from '@/components/routing/OrgAwareLink';

interface MobilePageBuilderHeaderProps {
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
  onSettingsOpen?: () => void;
}

const MobilePageBuilderHeader: React.FC<MobilePageBuilderHeaderProps> = ({
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
  onSettingsOpen
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const handleSave = async () => {
    await onSave();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handlePublish = async () => {
    if (published) {
      await onUnpublish();
    } else {
      await onPublish();
    }
    setShowMenu(false);
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between p-3">
        {/* Left: Back button and title */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <OrgAwareLink to="/">
            <Button variant="ghost" size="sm" className="p-1">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </OrgAwareLink>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-medium text-gray-900 truncate">
              {title || 'Page Builder'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {organizationId && (
                <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                  {isSubdomainAccess ? 'Subdomain' : 'Org'}: {organizationId.slice(0, 8)}...
                </Badge>
              )}
              {/* Page Status */}
              <div className="flex items-center gap-1">
                {published ? (
                  <>
                    <Globe className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">Published</span>
                  </>
                ) : (
                  <>
                    <GlobeLock className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">Draft</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Primary actions - always visible */}
          <Button 
            size="sm" 
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="text-xs px-3 min-w-[70px] transition-all duration-200"
            variant={justSaved ? "default" : "default"}
          >
            {isSaving ? (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving</span>
              </div>
            ) : justSaved ? (
              <div className="flex items-center gap-1 text-green-100">
                <Check className="h-3 w-3" />
                <span>Saved</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Save className="h-3 w-3" />
                <span>Save</span>
              </div>
            )}
          </Button>

          {/* Secondary actions in menu */}
          <Sheet open={showMenu} onOpenChange={setShowMenu}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-3 pt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    onPreview();
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>

                {/* Publish/Unpublish Button */}
                {published ? (
                  <Button
                    variant="destructive"
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="flex items-center gap-2 w-full"
                  >
                    <GlobeLock className="h-4 w-4" />
                    {isPublishing ? 'Unpublishing...' : 'Unpublish'}
                  </Button>
                ) : (
                  <Button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="flex items-center gap-2 w-full bg-green-600 hover:bg-green-700"
                  >
                    <Globe className="h-4 w-4" />
                    {isPublishing ? 'Publishing...' : 'Publish'}
                  </Button>
                )}
                
                {onSettingsOpen && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onSettingsOpen();
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full"
                  >
                    <Settings className="h-4 w-4" />
                    Page Settings
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default MobilePageBuilderHeader;
