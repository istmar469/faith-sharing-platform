
import React from 'react';
import { usePageManagerContext } from '../context/PageManagerProvider';
import PageBuilderLoading from './PageBuilderLoading';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PageManagerStatus: React.FC = () => {
  const { 
    isLoading, 
    error, 
    pageData, 
    isEditorReady,
    handleRetry,
    reset
  } = usePageManagerContext();

  // Show loading state
  if (isLoading) {
    return (
      <PageBuilderLoading 
        message="Loading page data..."
      />
    );
  }

  // Show error state with retry options
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page Builder Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={handleRetry}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
            <Button 
              onClick={reset}
              variant="destructive"
              className="flex items-center gap-2"
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading if page data exists but editor isn't ready
  if (pageData && !isEditorReady) {
    return (
      <PageBuilderLoading 
        message="Initializing editor..."
      />
    );
  }

  // Show loading if no page data
  if (!pageData) {
    return (
      <PageBuilderLoading 
        message="Preparing page builder..."
      />
    );
  }

  // This component should not render anything if everything is ready
  // The actual page builder will be rendered by the parent
  return null;
};

export default PageManagerStatus;
