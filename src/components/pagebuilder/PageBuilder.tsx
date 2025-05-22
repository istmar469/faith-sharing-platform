
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import SideNav from '../dashboard/SideNav';
import PageHeader from './PageHeader';
import PageCanvas from './PageCanvas';
import SidebarContainer from './sidebar/SidebarContainer';
import { PageBuilderProvider } from './context/PageBuilderContext';
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import LoginDialog from '../auth/LoginDialog';
import { getPageById } from '@/services/pages';
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const PageBuilder = () => {
  const [searchParams] = useSearchParams();
  const { pageId } = useParams();
  const organizationId = searchParams.get('organization_id');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [initialPageData, setInitialPageData] = useState(null);
  const [pageLoadError, setPageLoadError] = useState<string | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error checking auth status:", error);
        toast({
          title: "Authentication Error",
          description: "There was a problem verifying your login status.",
          variant: "destructive"
        });
        setLoginDialogOpen(true);
        setIsLoading(false);
        return;
      }
      
      if (!session) {
        console.log("No session found, showing login dialog");
        setLoginDialogOpen(true);
        setIsLoading(false);
        return;
      }
      
      // User is authenticated
      setIsAuthenticated(true);
      
      // Check if we have a pageId but no organizationId
      if (pageId && !organizationId) {
        // Fetch the page to get its organization_id
        const { data: pageData, error: pageError } = await supabase
          .from('pages')
          .select('organization_id')
          .eq('id', pageId)
          .single();
          
        if (!pageError && pageData) {
          // Redirect with the organization_id parameter
          navigate(`/page-builder/${pageId}?organization_id=${pageData.organization_id}`, { replace: true });
          return;
        }
      }
      
      // If we have a pageId, load the page data
      if (pageId) {
        try {
          console.log("PageBuilder: Loading page data for ID:", pageId);
          const page = await getPageById(pageId);
          console.log("PageBuilder: Page data loaded:", page);
          
          if (page) {
            setInitialPageData(page);
            toast({
              title: "Page loaded",
              description: `Successfully loaded "${page.title}"`,
            });
          } else {
            setPageLoadError("Page not found. It may have been deleted or you don't have access.");
          }
        } catch (error) {
          console.error("PageBuilder: Error loading page:", error);
          setPageLoadError(`Failed to load page: ${error instanceof Error ? error.message : 'Unknown error'}`);
          toast({
            title: "Error",
            description: "Could not load page data. Please try again.",
            variant: "destructive"
          });
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate, toast, pageId, organizationId]);
  
  // Loading screen
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading page builder...</span>
      </div>
    );
  }
  
  // Authentication screen
  if (loginDialogOpen) {
    return (
      <>
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="text-center max-w-md p-6">
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="mb-4 text-gray-600">You need to be logged in to use the page builder.</p>
          </div>
        </div>
        <LoginDialog 
          isOpen={loginDialogOpen} 
          setIsOpen={(open) => {
            setLoginDialogOpen(open);
            if (!open) {
              // If the dialog is closed, check auth again
              window.location.reload();
            }
          }} 
        />
      </>
    );
  }
  
  if (!isAuthenticated) {
    return null; // This will not render as the login dialog will be shown
  }

  // Error screen for page loading issues
  if (pageLoadError && pageId) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white shadow rounded">
          <h2 className="text-2xl font-bold mb-2 text-red-600">Error Loading Page</h2>
          <p className="mb-4 text-gray-600">{pageLoadError}</p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate('/page-builder')}>
              Create New Page
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // The main application - wrap everything with PageBuilderProvider
  return (
    <PageBuilderProvider initialPageData={initialPageData}>
      <div className="flex h-screen bg-gray-100">
        <SideNav />
        <div className="flex-1 flex flex-col">
          <PageHeader />
          
          {(!organizationId && !pageId) && (
            <Alert className="m-4" variant="warning">
              <AlertTitle>No organization selected</AlertTitle>
              <AlertDescription>
                You need to select an organization to create pages. Your page save may not work correctly.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex-1 flex overflow-hidden">
            <PageCanvas />
            <SidebarContainer />
          </div>
        </div>
      </div>
    </PageBuilderProvider>
  );
};

export default PageBuilder;
