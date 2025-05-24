
import React from 'react';
import { usePageCanvasState } from './hooks/usePageCanvasState';
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
  } = usePageCanvasState();

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
