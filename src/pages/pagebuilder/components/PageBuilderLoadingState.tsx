
import React from 'react';
import { Loader2 } from 'lucide-react';

const PageBuilderLoadingState: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading page builder...</span>
      </div>
    </div>
  );
};

export default PageBuilderLoadingState;
