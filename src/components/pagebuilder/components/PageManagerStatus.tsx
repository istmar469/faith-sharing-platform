
import React from 'react';
import { usePageManagerContext } from '../context/PageManagerProvider';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/components/context/TenantContext';
import { toast } from 'sonner';

const PageManagerStatus: React.FC = () => {
  const { 
    isLoading, 
    error, 
    pageData, 
    isEditorReady, 
    organizationId,
    handleRetry 
  } = usePageManagerContext();
  
  const { isSubdomainAccess } = useTenantContext();

  // Handle Force Refresh button
  const handleForceRefresh = async () => {
    console.log("PageManagerStatus: Force refresh triggered");
    toast.info("Forcing refresh...");
    
    try {
      if (handleRetry) {
        await handleRetry();
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error("Force refresh failed:", err);
      toast.error("Force refresh failed, reloading page...");
      window.location.reload();
    }
  };

  // Handle Start Fresh button - clear all page data and start over
  const handleStartFresh = async () => {
    console.log("PageManagerStatus: Start fresh triggered");
    toast.info("Starting fresh...");
    
    try {
      if (organizationId) {
        // Delete all pages for this organization
        const { error: deleteError } = await supabase
          .from('pages')
          .delete()
          .eq('organization_id', organizationId);
          
        if (deleteError) {
          console.error("Error deleting pages:", deleteError);
          toast.error("Failed to clear pages");
        } else {
          toast.success("All pages cleared, starting fresh");
        }
      }
      
      // Force a complete reload
      window.location.reload();
    } catch (err) {
      console.error("Start fresh failed:", err);
      toast.error("Start fresh failed, reloading page...");
      window.location.reload();
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Preparing editor...</h2>
          <p className="text-gray-600 mb-6">This is taking longer than usual</p>
          
          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={handleForceRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Force Refresh
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleStartFresh}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Start Fresh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-red-700">Failed to Load Editor</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={handleForceRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleStartFresh}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Start Fresh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show "waiting for editor" state
  if (pageData && !isEditorReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <div className="animate-pulse h-8 w-8 bg-blue-200 rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Initializing Editor...</h2>
          <p className="text-gray-600 mb-6">Setting up the page builder interface</p>
          
          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={handleForceRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Force Refresh
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleStartFresh}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Start Fresh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Should not reach here, but just in case
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-6">
        <h2 className="text-xl font-semibold mb-2">Loading...</h2>
        <p className="text-gray-600">Please wait while we prepare your page builder.</p>
      </div>
    </div>
  );
};

export default PageManagerStatus;
