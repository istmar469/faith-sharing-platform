
import React from 'react';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PageBuilderHeaderProps {
  organizationId: string | null;
  isSubdomainAccess: boolean;
  title: string;
  isSaving: boolean;
  onSave: () => void;
  onPreview: () => void;
  onBackToDashboard?: () => void;
}

const PageBuilderHeader: React.FC<PageBuilderHeaderProps> = ({
  organizationId,
  isSubdomainAccess,
  title,
  isSaving,
  onSave,
  onPreview,
  onBackToDashboard
}) => {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={onBackToDashboard}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {title || 'Visual Page Builder'}
              </h1>
              <p className="text-sm text-gray-500">
                Create and edit your website content with drag & drop
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onPreview}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button 
              size="sm"
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Page
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageBuilderHeader;
