
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
      <div className="h-full w-full">
        <div className="bg-white h-full flex items-center justify-center border border-gray-200">
          <div className="text-center">
            <p className="text-red-500 text-lg font-medium">Error: Missing organization ID</p>
            <p className="text-gray-500 text-sm mt-2">Please refresh the page or contact support</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white">
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
  );
};

export default PageBuilderEditor;
