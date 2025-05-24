
import React from 'react';
import { usePageManagerContext } from '../context/PageManagerProvider';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

const PageManagerStatus: React.FC = () => {
  const { 
    isLoading, 
    error, 
    retryCount, 
    isEditorReady,
    handleRetry 
  } = usePageManagerContext();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">
            Loading page builder...
            {retryCount > 0 && ` (Retry ${retryCount}/3)`}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        <div className="text-center">
          <Button onClick={handleRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show ready status - if we get here without error, we're good
  if (isEditorReady) {
    return null; // Everything is ready, don't show status
  }

  // Default loading for editor
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p className="text-sm text-gray-600">Preparing editor...</p>
      </div>
    </div>
  );
};

export default PageManagerStatus;
