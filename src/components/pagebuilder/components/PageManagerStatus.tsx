
import React, { useState } from 'react';
import { usePageManagerContext } from '../context/PageManagerProvider';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, AlertTriangle, RefreshCw, Info, Terminal, Trash2, Zap } from 'lucide-react';
import { toast } from 'sonner';

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

  const [showDebugConsole, setShowDebugConsole] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isForceRefreshing, setIsForceRefreshing] = useState(false);

  console.log("🔍 PageManagerStatus: Current state", {
    isLoading,
    error: !!error,
    retryCount,
    isEditorReady,
    hasPageData: !!pageData,
    organizationId: !!organizationId
  });

  const handleDeleteHomepage = async () => {
    if (!pageData?.id || !organizationId) return;
    
    try {
      setIsDeleting(true);
      console.log("🗑️ Deleting homepage:", pageData.id);
      
      // Import the deletePage function
      const { deletePage } = await import('@/services/pages');
      await deletePage(pageData.id);
      
      toast.success("Homepage deleted successfully!");
      
      // Navigate to page builder to create new page
      window.location.href = `/page-builder/${organizationId}`;
    } catch (err) {
      console.error("❌ Error deleting homepage:", err);
      toast.error("Failed to delete homepage");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleForceRefresh = () => {
    setIsForceRefreshing(true);
    console.log("🔄 Force refreshing page builder");
    
    // Clear any cached data and force reload
    if (organizationId) {
      window.location.href = `/page-builder/${organizationId}?t=${Date.now()}`;
    } else {
      window.location.reload();
    }
  };

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
          
          {/* Debug Console Button */}
          <Dialog open={showDebugConsole} onOpenChange={setShowDebugConsole}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="mt-4">
                <Terminal className="h-4 w-4 mr-2" />
                Show Debug Info
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-96 overflow-auto">
              <DialogHeader>
                <DialogTitle>Debug Console</DialogTitle>
              </DialogHeader>
              <div className="text-xs font-mono bg-gray-100 p-4 rounded">
                <p><strong>Loading State:</strong> {isLoading ? 'Yes' : 'No'}</p>
                <p><strong>Error:</strong> {error || 'None'}</p>
                <p><strong>Retry Count:</strong> {retryCount}</p>
                <p><strong>Editor Ready:</strong> {isEditorReady ? 'Yes' : 'No'}</p>
                <p><strong>Organization ID:</strong> {organizationId || 'None'}</p>
                <p><strong>Page Data:</strong> {pageData ? 'Loaded' : 'None'}</p>
                <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
              </div>
            </DialogContent>
          </Dialog>
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
        
        <div className="text-center space-y-3">
          <Button onClick={handleRetry} variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          
          <Button 
            onClick={handleForceRefresh} 
            variant="secondary" 
            className="w-full"
            disabled={isForceRefreshing}
          >
            <Zap className="h-4 w-4 mr-2" />
            {isForceRefreshing ? 'Force Refreshing...' : 'Force Refresh'}
          </Button>
          
          {pageData?.id && (
            <Button 
              onClick={handleDeleteHomepage} 
              variant="destructive" 
              className="w-full"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete Homepage & Start Fresh'}
            </Button>
          )}
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
          <p className="text-xs text-gray-400 mt-1">This is taking longer than usual</p>
          
          <div className="mt-4 space-y-2">
            <Button 
              onClick={handleForceRefresh} 
              variant="outline" 
              size="sm"
              disabled={isForceRefreshing}
            >
              <Zap className="h-4 w-4 mr-2" />
              {isForceRefreshing ? 'Refreshing...' : 'Force Refresh'}
            </Button>
            
            {pageData?.id && (
              <Button 
                onClick={handleDeleteHomepage} 
                variant="destructive" 
                size="sm"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Start Fresh'}
              </Button>
            )}
          </div>
          
          {/* Debug info in development */}
          {import.meta.env.DEV && (
            <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-left">
              <p className="font-semibold mb-1">Debug Status:</p>
              <p>✅ Page data loaded</p>
              <p>⏳ Waiting for editor to initialize</p>
              <p className="text-gray-500 mt-1">Check console for detailed logs</p>
              
              <Dialog open={showDebugConsole} onOpenChange={setShowDebugConsole}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="mt-2 w-full">
                    <Terminal className="h-4 w-4 mr-2" />
                    Show Debug Console
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-96 overflow-auto">
                  <DialogHeader>
                    <DialogTitle>Debug Console</DialogTitle>
                  </DialogHeader>
                  <div className="text-xs font-mono bg-gray-100 p-4 rounded">
                    <p><strong>State:</strong> Preparing Editor</p>
                    <p><strong>Page Data ID:</strong> {pageData?.id}</p>
                    <p><strong>Page Title:</strong> {pageData?.title}</p>
                    <p><strong>Organization ID:</strong> {organizationId}</p>
                    <p><strong>Is Editor Ready:</strong> {isEditorReady ? 'Yes' : 'No'}</p>
                    <p><strong>Content Blocks:</strong> {pageData?.content?.blocks?.length || 0}</p>
                    <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
                  </div>
                </DialogContent>
              </Dialog>
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
