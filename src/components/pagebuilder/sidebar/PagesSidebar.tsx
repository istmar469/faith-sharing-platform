
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import { usePageBuilder } from '../context/PageBuilderContext';

const PagesSidebar: React.FC = () => {
  const { 
    createNewPage,
    pageTitle,
    isPublished
  } = usePageBuilder();

  const handleCreatePage = () => {
    createNewPage();
  };

  return (
    <div className="h-full border-r bg-white">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900 mb-3">Pages</h3>
        <Button 
          onClick={handleCreatePage}
          className="w-full flex items-center gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          New Page
        </Button>
      </div>
      
      <div className="p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 border border-blue-200">
            <FileText className="h-4 w-4 text-blue-600" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-blue-900 truncate">
                {pageTitle || 'Untitled Page'}
              </div>
              <div className="text-xs text-blue-600">
                {isPublished ? 'Published' : 'Draft'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagesSidebar;
