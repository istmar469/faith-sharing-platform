
import React from 'react';
import { Loader2 } from 'lucide-react';

const PageBuilderLoadingState: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Page Builder</h2>
        <p className="text-gray-600">Setting up your editing environment...</p>
      </div>
    </div>
  );
};

export default PageBuilderLoadingState;
