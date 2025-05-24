
import React from 'react';
import { Loader2 } from 'lucide-react';

const EditorLoadingState: React.FC = () => {
  return (
    <div className="h-64 sm:h-96 flex items-center justify-center text-gray-400 flex-col px-4 text-center">
      <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 mb-2 animate-spin" />
      <p className="text-sm sm:text-base font-medium mb-1">Initializing Editor</p>
      <p className="text-xs sm:text-sm">Loading editing tools...</p>
    </div>
  );
};

export default EditorLoadingState;
