
import React from 'react';
import EditorComponent from '../editor/EditorComponent';
import EditorLoadingState from './EditorLoadingState';
import EditorErrorState from './EditorErrorState';
import EditorEmptyState from './EditorEmptyState';

interface PageCanvasContentProps {
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

const PageCanvasContent: React.FC<PageCanvasContentProps> = ({
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
  console.log("PageCanvasContent: Rendering with state", {
    organizationId: !!organizationId,
    hasContent,
    isEditorInitializing,
    editorError: !!editorError,
    showFallback
  });

  // Loading State
  if (isEditorInitializing) {
    return <EditorLoadingState onUseSimpleEditor={handleShowFallback} />;
  }
  
  // Error State
  if (editorError && !isEditorInitializing) {
    return (
      <EditorErrorState 
        error={editorError}
        onRetry={handleRetryEditor}
        onShowFallback={handleShowFallback}
      />
    );
  }
  
  // Empty State (when editor is ready but no content)
  if (!isEditorInitializing && !editorError && !hasContent) {
    return <EditorEmptyState />;
  }
  
  // Main Editor
  return (
    <div key={editorKey}>
      <EditorComponent 
        initialData={initialEditorData} 
        onChange={handleEditorChange}
        onReady={handleEditorReady} 
        organizationId={organizationId}
      />
    </div>
  );
};

export default PageCanvasContent;
