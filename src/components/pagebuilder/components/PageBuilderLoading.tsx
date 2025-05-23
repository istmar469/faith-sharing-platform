
import React from 'react';
import { Loader2 } from 'lucide-react';

interface PageBuilderLoadingProps {
  message?: string;
}

const PageBuilderLoading: React.FC<PageBuilderLoadingProps> = ({ 
  message = "Loading page builder..." 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">Page Builder</p>
        <p className="text-sm text-gray-500">{message}</p>
        <div className="mt-4 text-xs text-gray-400">
          Loading should complete within 5 seconds...
        </div>
      </div>
    </div>
  );
};

export default PageBuilderLoading;
