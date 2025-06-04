
import React from 'react';
import { Data } from '@measured/puck';
import PuckOnlyEditor from '@/components/pagebuilder/puck/PuckOnlyEditor';
import { Button } from '@/components/ui/button';
import { Save, Eye, ArrowLeft, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ConsolidatedPageBuilderLayoutProps {
  pageTitle: string;
  pageContent: Data;
  isPublished: boolean;
  isHomepage: boolean;
  organizationId: string;
  isSaving: boolean;
  isDirty: boolean;
  isMobile: boolean;
  isSubdomainAccess: boolean;
  saveStatus?: string;
  lastSaveTime?: Date;
  onContentChange: (data: Data) => void;
  onTitleChange: (title: string) => void;
  onHomepageChange: (isHomepage: boolean) => void;
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
  saveStatus,
  lastSaveTime,
  onContentChange,
  onBackToDashboard,
  onPreview
}) => {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header Bar */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20">
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
          
          <div className="h-6 w-px bg-gray-300" />
          
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900 truncate max-w-96">
              {pageTitle}
            </h1>
            <div className="flex items-center gap-2">
              {isPublished && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Published
                </Badge>
              )}
              {isHomepage && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Home className="h-3 w-3 mr-1" />
                  Homepage
                </Badge>
              )}
              {isDirty && (
                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                  Unsaved
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveStatus && (
            <span className="text-sm text-gray-600">
              {saveStatus}
              {lastSaveTime && (
                <span className="ml-1">
                  at {lastSaveTime.toLocaleTimeString()}
                </span>
              )}
            </span>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview(true)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 overflow-hidden">
        <PuckOnlyEditor
          initialData={pageContent}
          onChange={onContentChange}
          organizationId={organizationId}
          mode="edit"
        />
      </div>
    </div>
  );
};

export default ConsolidatedPageBuilderLayout;
