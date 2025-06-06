import React, { useState } from 'react';
import { Data } from '@measured/puck';
import PuckOnlyEditor from '@/components/pagebuilder/puck/PuckOnlyEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Eye, ArrowLeft, Home, Edit3, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ConsolidatedPageBuilderLayoutProps {
  pageTitle: string;
  pageSlug: string;
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
  onSave: (data: Data) => void;
  onTitleChange: (title: string) => void;
  onSlugChange: (slug: string) => void;
  onHomepageChange: (isHomepage: boolean) => void;
  onBackToDashboard: () => void;
  onPreview: (live?: boolean) => void;
}

const ConsolidatedPageBuilderLayout: React.FC<ConsolidatedPageBuilderLayoutProps> = ({
  pageTitle,
  pageSlug,
  pageContent,
  isPublished,
  isHomepage,
  organizationId,
  isSaving,
  isDirty,
  saveStatus,
  lastSaveTime,
  onContentChange,
  onSave,
  onTitleChange,
  onSlugChange,
  onBackToDashboard,
  onPreview
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [tempTitle, setTempTitle] = useState(pageTitle);
  const [tempSlug, setTempSlug] = useState(pageSlug);

  const handleSave = (data: Data) => {
    console.log('ConsolidatedPageBuilderLayout: Save triggered with data', data);
    // Update content first
    onContentChange(data);
    // Then trigger save
    onSave(data);
  };

  const handleTitleSave = () => {
    onTitleChange(tempTitle);
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTempTitle(pageTitle);
    setIsEditingTitle(false);
  };

  const handleSlugSave = () => {
    onSlugChange(tempSlug);
    setIsEditingSlug(false);
  };

  const handleSlugCancel = () => {
    setTempSlug(pageSlug);
    setIsEditingSlug(false);
  };

  // Update temp values when props change
  React.useEffect(() => {
    setTempTitle(pageTitle);
  }, [pageTitle]);

  React.useEffect(() => {
    setTempSlug(pageSlug);
  }, [pageSlug]);
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
          
          <div className="flex flex-col gap-1">
            {/* Title Row */}
            <div className="flex items-center gap-3">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    className="text-lg font-semibold h-8 min-w-64"
                    placeholder="Page title"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleSave();
                      if (e.key === 'Escape') handleTitleCancel();
                    }}
                  />
                  <Button size="sm" variant="ghost" onClick={handleTitleSave}>
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleTitleCancel}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-gray-900 truncate max-w-96">
                    {pageTitle || 'Untitled Page'}
                  </h1>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setIsEditingTitle(true)}
                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                </div>
              )}
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
            
            {/* Slug Row */}
            <div className="flex items-center gap-3">
              {isEditingSlug ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">URL:</span>
                  <span className="text-sm text-gray-400">test3.localhost:8081/</span>
                  <Input
                    value={tempSlug}
                    onChange={(e) => setTempSlug(e.target.value)}
                    className="text-sm h-6 min-w-48"
                    placeholder="page-slug"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSlugSave();
                      if (e.key === 'Escape') handleSlugCancel();
                    }}
                  />
                  <Button size="sm" variant="ghost" onClick={handleSlugSave}>
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleSlugCancel}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">URL:</span>
                  <span className="text-sm text-gray-400">test3.localhost:8081/</span>
                  <span className="text-sm font-mono text-blue-600">{pageSlug || 'page-slug'}</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setIsEditingSlug(true)}
                    className="h-4 w-4 p-0 opacity-60 hover:opacity-100"
                  >
                    <Edit3 className="h-2 w-2" />
                  </Button>
                </div>
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
            onClick={() => onPreview(isDirty)}
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
          onSave={handleSave}
          organizationId={organizationId}
          mode="edit"
        />
      </div>
    </div>
  );
};

export default ConsolidatedPageBuilderLayout;
