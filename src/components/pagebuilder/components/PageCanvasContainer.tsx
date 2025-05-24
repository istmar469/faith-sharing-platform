
import React from 'react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import PageCanvasContent from './PageCanvasContent';

interface PageCanvasContainerProps {
  organizationId: string;
  isEditorInitializing: boolean;
  editorError: string | null;
  showFallback: boolean;
  hasContent: boolean;
  editorKey: number;
  initialEditorData: any;
  pageElements: any;
  handleEditorChange: (data: any) => void;
  handleEditorReady: () => void;
  handleRetryEditor: () => void;
  handleShowFallback: () => void;
}

const PageCanvasContainer: React.FC<PageCanvasContainerProps> = (props) => {
  const { organizationId } = props;
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  if (!organizationId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-red-500">Error: Missing organization ID</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex-1 overflow-auto bg-gray-50 p-2 transition-all duration-300", 
      isMobile ? "px-1" : "sm:p-4 md:p-6"
    )}>
      <div 
        className={cn(
          "mx-auto bg-white shadow-sm rounded-lg min-h-full border transition-all duration-200",
          "max-w-full sm:max-w-4xl",
          "border-gray-200 pb-20"
        )}
      >
        <PageCanvasContent {...props} />
      </div>
    </div>
  );
};

export default PageCanvasContainer;
