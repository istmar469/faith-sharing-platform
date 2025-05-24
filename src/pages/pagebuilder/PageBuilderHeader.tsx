
import React from 'react';
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import OrgAwareLink from '@/components/routing/OrgAwareLink';

interface PageBuilderHeaderProps {
  organizationId: string | null;
  isSubdomainAccess: boolean;
  title: string;
  isSaving: boolean;
  onSave: () => void;
  onPreview: () => void;
}

const PageBuilderHeader: React.FC<PageBuilderHeaderProps> = ({
  organizationId,
  isSubdomainAccess,
  title,
  isSaving,
  onSave,
  onPreview
}) => {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <OrgAwareLink to="/">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </OrgAwareLink>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Page Builder</h1>
              <p className="text-sm text-gray-500">Create and edit your website content</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {organizationId && (
              <Badge variant="outline" className="text-xs">
                {isSubdomainAccess ? 'Subdomain' : 'Organization'}: {organizationId.slice(0, 8)}...
              </Badge>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onPreview}
                className="flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button 
                size="sm" 
                onClick={onSave}
                disabled={isSaving || !title.trim()}
                className="flex items-center gap-1"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageBuilderHeader;
