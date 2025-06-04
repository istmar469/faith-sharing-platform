
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Eye, Globe, Clock, CheckCircle } from 'lucide-react';
import PageBuilderEditor from '../PageBuilderEditor';

interface ConsolidatedPageBuilderLayoutProps {
  pageTitle: string;
  pageContent: any;
  isPublished: boolean;
  isHomepage: boolean;
  organizationId: string;
  isSaving: boolean;
  isDirty: boolean;
  isMobile: boolean;
  isSubdomainAccess: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSaveTime: Date | null;
  onContentChange: (data: any) => void;
  onTitleChange: (title: string) => void;
  onHomepageChange: () => void;
  onSave: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onBackToDashboard: () => void;
  onPreview: (live?: boolean) => void;
}

const ConsolidatedPageBuilderLayout: React.FC<ConsolidatedPageBuilderLayoutProps> = ({
  pageTitle,
  pageContent,
  isPublished,
  isHomepage,
  organizationId,
  isSaving,
  isDirty,
  isMobile,
  isSubdomainAccess,
  saveStatus,
  lastSaveTime,
  onContentChange,
  onTitleChange,
  onHomepageChange,
  onSave,
  onPublish,
  onUnpublish,
  onBackToDashboard,
  onPreview
}) => {
  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <Clock className="h-4 w-4 animate-spin" />;
      case 'saved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <div className="h-4 w-4 bg-red-500 rounded-full" />;
      default:
        return null;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return lastSaveTime ? `Saved ${lastSaveTime.toLocaleTimeString()}` : 'Saved';
      case 'error':
        return 'Save failed';
      default:
        return isDirty ? 'Unsaved changes' : 'All changes saved';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
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
            
            <div className="flex items-center gap-3">
              <Input
                value={pageTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Page title..."
                className="text-lg font-medium border-none p-0 h-auto focus-visible:ring-0"
              />
              
              <div className="flex items-center gap-2">
                {isPublished ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Globe className="h-3 w-3 mr-1" />
                    Published
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    Draft
                  </Badge>
                )}
                
                {isHomepage && (
                  <Badge variant="outline">
                    Homepage
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Save Status */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {getSaveStatusIcon()}
              <span>{getSaveStatusText()}</span>
            </div>

            {/* Homepage Toggle */}
            <div className="flex items-center gap-2">
              <label htmlFor="homepage-toggle" className="text-sm text-gray-600">
                Homepage
              </label>
              <Switch
                id="homepage-toggle"
                checked={isHomepage}
                onCheckedChange={onHomepageChange}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreview(true)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onSave}
                disabled={isSaving || !isDirty}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </Button>

              {isPublished ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onUnpublish}
                  disabled={isSaving}
                >
                  Unpublish
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={onPublish}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Globe className="h-4 w-4 mr-1" />
                  Publish
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 relative">
        <PageBuilderEditor
          content={pageContent}
          onContentChange={onContentChange}
        />
      </div>
    </div>
  );
};

export default ConsolidatedPageBuilderLayout;
