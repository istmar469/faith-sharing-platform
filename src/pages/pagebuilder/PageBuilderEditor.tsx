
import React from 'react';
import { PageBuilderProvider } from '@/components/pagebuilder/context/PageBuilderContext';
import PageCanvasContainer from '@/components/pagebuilder/components/PageCanvasContainer';
import { useTenantContext } from '@/components/context/TenantContext';

interface PageBuilderEditorProps {
  content: any;
  onContentChange: (data: any) => void;
}

const PageBuilderEditor: React.FC<PageBuilderEditorProps> = ({
  content,
  onContentChange
}) => {
  const { organizationId } = useTenantContext();

  // Create initial page data for the provider
  const initialPageData = {
    content: content,
    organization_id: organizationId,
    title: 'Untitled Page',
    slug: '',
    published: false,
    show_in_navigation: true,
    is_homepage: false
  };

  return (
    <div className="lg:col-span-3">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[600px]">
        <PageBuilderProvider initialPageData={initialPageData}>
          <PageCanvasContainer
            organizationId={organizationId || ''}
            isEditorInitializing={false}
            editorError={null}
            showFallback={false}
            hasContent={!!content}
            editorKey={1}
            initialEditorData={content}
            pageElements={content}
            handleEditorChange={onContentChange}
            handleEditorReady={() => {}}
            handleRetryEditor={() => {}}
            handleShowFallback={() => {}}
          />
        </PageBuilderProvider>
      </div>
    </div>
  );
};

export default PageBuilderEditor;
