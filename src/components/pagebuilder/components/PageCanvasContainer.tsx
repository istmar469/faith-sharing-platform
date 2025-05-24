
import React from 'react';
import HybridEditor from '../puck/HybridEditor';
import EditorLoadingState from './EditorLoadingState';
import EditorErrorState from './EditorErrorState';
import EditorEmptyState from './EditorEmptyState';
import { EditorJSData } from '../context/pageBuilderTypes';

interface PageCanvasContainerProps {
  organizationId: string;
  isEditorInitializing: boolean;
  editorError: string | null;
  showFallback: boolean;
  hasContent: boolean;
  editorKey: number;
  initialEditorData: EditorJSData | null;
  pageElements: EditorJSData | null;
  handleEditorChange: (data: EditorJSData) => void;
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
  console.log("PageCanvasContainer: Rendering with state", {
    organizationId: !!organizationId,
    isEditorInitializing,
    editorError: !!editorError,
    showFallback,
    hasContent,
    editorKey,
    hasInitialData: !!initialEditorData
  });

  // Validate organization ID
  if (!organizationId) {
    console.error("PageCanvasContainer: Missing organization ID");
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Missing Organization ID</p>
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

  // Render the hybrid editor (Puck + Editor.js)
  console.log("PageCanvasContainer: Rendering hybrid editor component");
  return (
    <div className="h-full bg-white">
      <HybridEditor
        key={editorKey}
        initialData={initialEditorData}
        onChange={handleEditorChange}
        organizationId={organizationId}
        editorMode="visual"
      />
    </div>
  );
};

export default PageCanvasContainer;
