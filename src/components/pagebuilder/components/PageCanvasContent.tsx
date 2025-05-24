import React from 'react';
import EditorComponent from '../editor/RefactoredEditorComponent';

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
  editorKey,
  initialEditorData,
  handleEditorChange,
  handleEditorReady
}) => {
  console.log("PageCanvasContent: Rendering simplified editor", {
    organizationId: !!organizationId,
    hasInitialData: !!initialEditorData
  });

  if (!organizationId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error: Missing organization ID</p>
      </div>
    );
  }

  // Always render the editor - let the EditorComponent handle loading states
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
