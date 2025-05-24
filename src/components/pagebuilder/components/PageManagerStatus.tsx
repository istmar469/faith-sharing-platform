
import React from 'react';
import { usePageManagerContext } from '../context/PageManagerProvider';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, RefreshCw, Info } from 'lucide-react';

const PageManagerStatus: React.FC = () => {
  const { 
    isLoading, 
    error, 
    retryCount, 
    isEditorReady,
    pageData,
    organizationId,
    handleRetry 
  } = usePageManagerContext();

  console.log("🔍 PageManagerStatus: Current state", {
    isLoading,
    error: !!error,
    retryCount,
    isEditorReady,
    hasPageData: !!pageData,
    organizationId: !!organizationId
  });

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
          <p className="text-xs text-gray-400 mt-2">
            Organization ID: {organizationId ? '✓' : '✗'}
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
        
        {/* Debug info in development */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>Organization ID: {organizationId || 'None'}</p>
            <p>Page Data: {pageData ? 'Loaded' : 'None'}</p>
            <p>Retry Count: {retryCount}</p>
          </div>
        )}
      </div>
    );
  }

  // Show ready status - if we get here without error, we're good
  if (isEditorReady) {
    console.log("✅ PageManagerStatus: Editor is ready, returning null");
    return null; // Everything is ready, don't show status
  }

  // Show debug info if page data is loaded but editor isn't ready yet
  if (pageData && !isEditorReady) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Preparing editor...</p>
          
          {/* Debug info in development */}
          {import.meta.env.DEV && (
            <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-left">
              <p className="font-semibold mb-1">Debug Status:</p>
              <p>✅ Page data loaded</p>
              <p>⏳ Waiting for editor to initialize</p>
              <p className="text-gray-500 mt-1">Check console for detailed logs</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default loading for editor
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p className="text-sm text-gray-600">Initializing...</p>
      </div>
    </div>
  );
};

export default PageManagerStatus;
