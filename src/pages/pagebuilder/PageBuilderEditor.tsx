
import React from 'react';
import { useTenantContext } from '@/components/context/TenantContext';
import { useMediaQuery } from '@/hooks/use-media-query';
import PuckOnlyEditor from '@/components/pagebuilder/puck/PuckOnlyEditor';
import MobilePuckEditor from '@/components/pagebuilder/puck/MobilePuckEditor';

interface PageBuilderEditorProps {
  content: any;
  onContentChange: (data: any) => void;
}

const PageBuilderEditor: React.FC<PageBuilderEditorProps> = ({
  content,
  onContentChange
}) => {
  const { organizationId } = useTenantContext();
  const isMobile = useMediaQuery("(max-width: 768px)");

  console.log('PageBuilderEditor: Rendering Puck-only editor', {
    isMobile,
    hasContent: !!content,
    organizationId: !!organizationId
  });

  // Ensure we have a valid organization ID
  if (!organizationId) {
    return (
      <div className="lg:col-span-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[600px] flex items-center justify-center">
          <p className="text-red-500">Error: Missing organization ID</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-3">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[600px]">
        {isMobile ? (
          <MobilePuckEditor
            initialData={content || { content: [], root: {} }}
            onChange={onContentChange}
            organizationId={organizationId}
            mode="edit"
          />
        ) : (
          <PuckOnlyEditor
            initialData={content || { content: [], root: {} }}
            onChange={onContentChange}
            organizationId={organizationId}
            mode="edit"
          />
        )}
      </div>
    </div>
  );
};

export default PageBuilderEditor;
