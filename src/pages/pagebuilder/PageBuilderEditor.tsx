
import React from 'react';
import MinimalEditor from '@/components/pagebuilder/MinimalEditor';

interface PageBuilderEditorProps {
  content: any;
  onContentChange: (data: any) => void;
}

const PageBuilderEditor: React.FC<PageBuilderEditorProps> = ({
  content,
  onContentChange
}) => {
  return (
    <div className="lg:col-span-3">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <MinimalEditor
            initialData={content}
            onSave={onContentChange}
          />
        </div>
      </div>
    </div>
  );
};

export default PageBuilderEditor;
