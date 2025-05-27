
import React from 'react';
import PuckOnlyEditor from '../puck/PuckOnlyEditor';
import MobilePuckEditor from '../puck/MobilePuckEditor';
import { useMediaQuery } from '@/hooks/use-media-query';
import EditorLoadingState from './EditorLoadingState';
import EditorErrorState from './EditorErrorState';
import EditorEmptyState from './EditorEmptyState';

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

const PageCanvasContainer: React.FC<PageCanvasContainerProps> = ({
  organizationId,
  isEditorInitializing,
  editorError,
  showFallback,
  hasContent,
  editorKey,
  initialEditorData,
  pageElements,
  handleEditorChange,
  handleEditorReady,
  handleRetryEditor,
  handleShowFallback
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  console.log("PageCanvasContainer: Rendering Puck-only editor", {
    organizationId: !!organizationId,
    isEditorInitializing,
    editorError: !!editorError,
    showFallback,
    hasContent,
    editorKey,
    isMobile,
    isTablet,
    hasInitialData: !!initialEditorData
  });

  // Validate organization ID
  if (!organizationId) {
    console.error("PageCanvasContainer: Missing organization ID");
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-red-500 mb-2 text-lg font-medium">Missing Organization ID</p>
          <p className="text-sm text-gray-500">Please refresh the page or contact support</p>
        </div>
      </div>
    );
  }

  // Show loading state while editor is initializing
  if (isEditorInitializing) {
    console.log("PageCanvasContainer: Showing loading state");
    return (
      <EditorLoadingState 
        message="Setting up the visual page builder..."
        showRetry={false}
      />
    );
  }

  // Show error state if there's an editor error
  if (editorError) {
    console.log("PageCanvasContainer: Showing error state", editorError);
    return (
      <EditorErrorState 
        error={editorError}
        onRetry={handleRetryEditor}
        onShowFallback={handleShowFallback}
      />
    );
  }

  // Show empty state if no content and not using fallback
  if (!hasContent && !showFallback) {
    console.log("PageCanvasContainer: Showing empty state");
    return <EditorEmptyState />;
  }

  // Render the appropriate Puck editor based on device
  console.log("PageCanvasContainer: Rendering Puck editor", { isMobile, isTablet });
  return (
    <div className="h-full w-full bg-white relative">
      {isMobile || isTablet ? (
        <MobilePuckEditor
          key={editorKey}
          initialData={initialEditorData || { content: [], root: {} }}
          onChange={handleEditorChange}
          organizationId={organizationId}
          mode="edit"
        />
      ) : (
        <PuckOnlyEditor
          key={editorKey}
          initialData={initialEditorData || { content: [], root: {} }}
          onChange={handleEditorChange}
          organizationId={organizationId}
          mode="edit"
        />
      )}
    </div>
  );
};

export default PageCanvasContainer;
