
import React from 'react';
import { LayoutGrid } from 'lucide-react';

const EditorEmptyState: React.FC = () => {
  return (
    <div className="h-64 sm:h-96 flex items-center justify-center text-gray-400 flex-col px-4 text-center">
      <LayoutGrid className="h-8 w-8 sm:h-12 sm:w-12 mb-2" />
      <p className="text-sm sm:text-base font-medium mb-1">Start Building Your Page</p>
      <p className="text-xs sm:text-sm">Click below to start writing</p>
    </div>
  );
};

export default EditorEmptyState;
