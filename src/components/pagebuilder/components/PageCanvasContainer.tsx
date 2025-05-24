
import React from 'react';
import EditorComponent from '../editor/EditorComponent';
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
  // Show loading state while editor is initializing
  if (isEditorInitializing) {
    return (
      <EditorLoadingState 
        message="Setting up the editor interface..."
        showRetry={false}
      />
    );
  }

  // Show error state if there's an editor error
  if (editorError) {
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
    return <EditorEmptyState />;
  }

  // Render the actual editor
  return (
    <div className="h-full bg-white">
      <EditorComponent
        key={editorKey}
        initialData={initialEditorData}
        onChange={handleEditorChange}
        onReady={handleEditorReady}
        editorId="page-editor"
        readOnly={false}
        organizationId={organizationId}
      />
    </div>
  );
};

export default PageCanvasContainer;
