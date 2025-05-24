
import React from 'react';
import { Loader2 } from 'lucide-react';

interface PageBuilderLoadingProps {
  message?: string;
  showActions?: boolean;
  onForceRefresh?: () => void;
  onStartFresh?: () => void;
}

const PageBuilderLoading: React.FC<PageBuilderLoadingProps> = ({ 
  message = "Initializing Page Builder...",
  showActions = false,
  onForceRefresh,
  onStartFresh
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-6">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page Builder</h2>
          <p className="text-gray-600">{message}</p>
          <p className="text-sm text-gray-500 mt-2">Setting up the editor interface...</p>
        </div>
        
        {showActions && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onForceRefresh && (
              <button
                onClick={onForceRefresh}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Force Refresh
              </button>
            )}
            {onStartFresh && (
              <button
                onClick={onStartFresh}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Start Fresh
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageBuilderLoading;
