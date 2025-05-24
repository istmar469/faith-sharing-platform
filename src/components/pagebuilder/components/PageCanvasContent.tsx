
import React from 'react';
import EditorComponent from '../editor/EditorComponent';
import EditorLoadingState from './EditorLoadingState';
import EditorErrorState from './EditorErrorState';
import EditorEmptyState from './EditorEmptyState';
import FallbackEditor from './FallbackEditor';

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

  // Loading State with option to skip to simple editor
  if (isEditorInitializing && !showFallback) {
    return <EditorLoadingState onUseSimpleEditor={handleShowFallback} />;
  }
  
  // Error State
  if (editorError && !isEditorInitializing && !showFallback) {
    return (
      <EditorErrorState 
        error={editorError}
        onRetry={handleRetryEditor}
        onShowFallback={handleShowFallback}
      />
    );
  }
  
  // Empty State
  if (!isEditorInitializing && !editorError && !hasContent && !showFallback) {
    return <EditorEmptyState />;
  }
  
  // Fallback Simple Editor
  if (showFallback) {
    return (
      <FallbackEditor
        pageElements={pageElements}
        onChange={handleEditorChange}
      />
    );
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
