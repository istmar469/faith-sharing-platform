
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Globe, GlobeLock, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import PuckOnlyEditor from './puck/PuckOnlyEditor';
import { usePageBuilder } from '@/hooks/usePageBuilder';

const SimplePageBuilder: React.FC = () => {
  const {
    pageData,
    pageTitle,
    pageContent,
    isPublished,
    organizationId,
    isSaving,
    isLoading,
    error,
    isDirty,
    handleSave,
    handleContentChange,
    handleTitleChange,
    handlePublish,
    handleUnpublish
  } = usePageBuilder();

  const handleBackToDashboard = () => {
    if (organizationId) {
      window.location.href = `/dashboard/${organizationId}`;
    } else {
      window.location.href = '/dashboard';
    }
  };

  const handlePreview = () => {
    if (pageData?.id) {
      window.open(`/preview/${pageData.id}`, '_blank');
    } else {
      // For new pages, save first then preview
      handleSave().then((success) => {
        if (success && pageData?.id) {
          window.open(`/preview/${pageData.id}`, '_blank');
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading page builder...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleBackToDashboard}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
          <div className="px-4 py-3 flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBackToDashboard}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
              
              <div className="min-w-0 flex-1 max-w-md">
                <Input
                  value={pageTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Page title..."
                  className="font-semibold"
                />
              </div>
              
              <div className="flex items-center gap-2">
                {isPublished ? (
                  <Badge variant="default" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    <Globe className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">
                    <GlobeLock className="h-3 w-3 mr-1" />
                    Draft
                  </Badge>
                )}
                {isDirty && (
                  <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                    Unsaved
                  </Badge>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handlePreview}
                    disabled={isSaving}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Preview your page</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    disabled={!isDirty || isSaving}
                  >
                    {isSaving ? (
                      <div className="h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-1" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save your changes</TooltipContent>
              </Tooltip>

              {isPublished ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUnpublish}
                  disabled={isSaving}
                  className="text-red-600 hover:text-red-700 border-red-200"
                >
                  <GlobeLock className="h-4 w-4 mr-1" />
                  Unpublish
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handlePublish}
                  disabled={isSaving || !pageTitle.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Globe className="h-4 w-4 mr-1" />
                  Publish
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="h-[calc(100vh-73px)]">
          <PuckOnlyEditor
            initialData={pageContent}
            onSave={handleSave}
            onChange={handleContentChange}
            organizationId={organizationId || ''}
            mode="edit"
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default SimplePageBuilder;
