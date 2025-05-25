
import React, { useState } from 'react';
import { ArrowLeft, Save, Eye, Menu, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import OrgAwareLink from '@/components/routing/OrgAwareLink';

interface MobilePageBuilderHeaderProps {
  organizationId: string | null;
  isSubdomainAccess: boolean;
  title: string;
  isSaving: boolean;
  onSave: () => void;
  onPreview: () => void;
  onSettingsOpen?: () => void;
}

const MobilePageBuilderHeader: React.FC<MobilePageBuilderHeaderProps> = ({
  organizationId,
  isSubdomainAccess,
  title,
  isSaving,
  onSave,
  onPreview,
  onSettingsOpen
}) => {
  const [showMenu, setShowMenu] = useState(false);

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
            {organizationId && (
              <Badge variant="outline" className="text-xs mt-1 hidden sm:inline-flex">
                {isSubdomainAccess ? 'Subdomain' : 'Org'}: {organizationId.slice(0, 8)}...
              </Badge>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Primary actions - always visible */}
          <Button 
            size="sm" 
            onClick={onSave}
            disabled={isSaving || !title.trim()}
            className="text-xs px-2"
          >
            {isSaving ? 'Saving...' : 'Save'}
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
