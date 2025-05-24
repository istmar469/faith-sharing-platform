
import React from 'react';
import { usePuckCanvasState } from './hooks/usePuckCanvasState';
import PageCanvasContainer from './components/PageCanvasContainer';

const PageCanvas: React.FC = () => {
  const {
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
  } = usePuckCanvasState();

  return (
    <PageCanvasContainer
      organizationId={organizationId || ''}
      isEditorInitializing={isEditorInitializing}
      editorError={editorError}
      showFallback={showFallback}
      hasContent={hasContent}
      editorKey={editorKey}
      initialEditorData={initialEditorData}
      pageElements={pageElements}
      handleEditorChange={handleEditorChange}
      handleEditorReady={handleEditorReady}
      handleRetryEditor={handleRetryEditor}
      handleShowFallback={handleShowFallback}
    />
  );
};

export default React.memo(PageCanvas);
