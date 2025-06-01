import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { History, Clock, User, ArrowLeft, RotateCcw, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Version management interface (temporary until backend is ready)
export interface PageVersion {
  version_number: number;
  title: string;
  created_at: string;
  created_by_email: string;
  change_description: string;
  is_major_version: boolean;
  is_published: boolean;
  is_current: boolean;
}

interface PageVersionHistoryProps {
  pageId: string;
  versions: PageVersion[];
  currentVersion?: number;
  onRevertToVersion?: (versionNumber: number) => void;
  onPreviewVersion?: (versionNumber: number) => void;
  onClose?: () => void;
  isLoading?: boolean;
}

const PageVersionHistory: React.FC<PageVersionHistoryProps> = ({
  pageId,
  versions,
  currentVersion,
  onRevertToVersion,
  onPreviewVersion,
  onClose,
  isLoading = false
}) => {
  const [reverting, setReverting] = useState<number | null>(null);

  const handleRevert = async (versionNumber: number) => {
    if (!onRevertToVersion) return;
    
    setReverting(versionNumber);
    try {
      await onRevertToVersion(versionNumber);
    } catch (error) {
      console.error('Failed to revert to version:', error);
    } finally {
      setReverting(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {versions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No version history available</p>
              <p className="text-sm">Version tracking will be available soon.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {versions.map((version) => (
                <div
                  key={version.version_number}
                  className={`p-4 border rounded-lg transition-all duration-200 ${
                    version.is_current
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900 truncate">
                          {version.title}
                        </h4>
                        <div className="flex items-center gap-1">
                          {version.is_current && (
                            <Badge variant="default" className="text-xs">
                              Current
                            </Badge>
                          )}
                          {version.is_published && (
                            <Badge variant="secondary" className="text-xs">
                              Published
                            </Badge>
                          )}
                          {version.is_major_version && (
                            <Badge variant="outline" className="text-xs">
                              Major
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            v{version.version_number}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{version.created_by_email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      
                      {version.change_description && (
                        <p className="text-sm text-gray-600 italic">
                          "{version.change_description}"
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {onPreviewVersion && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onPreviewVersion(version.version_number)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Preview this version</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      
                      {onRevertToVersion && !version.is_current && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevert(version.version_number)}
                              disabled={reverting === version.version_number}
                              className="h-8 w-8 p-0"
                            >
                              {reverting === version.version_number ? (
                                <div className="h-3 w-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <RotateCcw className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Revert to this version</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {versions.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Reverting to a previous version will create a new version based on the selected content.
                Your current work will not be lost.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default PageVersionHistory; 