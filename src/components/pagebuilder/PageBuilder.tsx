
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import SideNav from './PageSideNav';
import PageHeader from './PageHeader';
import PageCanvas from './PageCanvas';
import { PageBuilderProvider } from './context/PageBuilderContext';
import { PageData } from './context/types';
import SidebarContainer from './sidebar/SidebarContainer';
import LoginDialog from '../auth/LoginDialog';
import { useOrganizationId } from './context/useOrganizationId';
import DebugPanel from './preview/DebugPanel';

const PageBuilder = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [initialPageData, setInitialPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageLoadError, setPageLoadError] = useState<string | null>(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const { organizationId, isLoading: orgIdLoading } = useOrganizationId(pageId);
  
  useEffect(() => {
    const checkAuth = async () => {
      if (orgIdLoading) return;
      
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        const { data, error } = await supabase.auth.getUser();
        
        if (error || !data.user) {
          console.error("User not authenticated. Showing login dialog.");
          setLoginDialogOpen(true);
          return;
        }
        
        // If we have an organization ID, load the page data
        if (organizationId) {
          console.log("Loading page for organization:", organizationId);
          await loadPageData(organizationId);
        } else {
          console.error("No organization ID available");
          setPageLoadError("Could not determine organization ID");
        }
      } catch (err) {
        console.error("Error in authentication check:", err);
        setPageLoadError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, toast, pageId, organizationId, orgIdLoading]);
  
  const loadPageData = async (orgId: string) => {
    try {
      // If pageId is provided, try to load that specific page
      if (pageId && pageId !== orgId) {
        console.log("Loading existing page:", pageId);
        const { data, error } = await supabase
          .from('pages')
          .select('*')
          .eq('id', pageId)
          .single();
        
        if (error) {
          console.error('Error loading page:', error);
          setPageLoadError(`Failed to load page: ${error.message}`);
          return;
        }
        
        if (!data) {
          console.error('Page not found:', pageId);
          setPageLoadError('Page not found');
          return;
        }
        
        console.log("Page data loaded successfully:", data);
        setInitialPageData(data as unknown as PageData);
      } else {
        // Create a new page template
        console.log("Creating new page for organization:", orgId);
        const newPage: Partial<PageData> = {
          title: 'New Page',
          slug: 'new-page',
          content: [],
          organization_id: orgId,
          is_homepage: false,
          published: false,
          show_in_navigation: true
        };
        
        setInitialPageData(newPage as PageData);
      }
    } catch (err) {
      console.error('Error in loadPageData:', err);
      setPageLoadError('An unexpected error occurred while loading the page');
    }
  };
  
  // Loading screen
  if (isLoading || orgIdLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading page builder...</p>
        </div>
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
            <p className="mb-4 text-gray-600">
              Please log in to access the page builder.
            </p>
          </div>
        </div>
        <LoginDialog 
          isOpen={loginDialogOpen} 
          setIsOpen={(open) => {
            setLoginDialogOpen(open);
            if (!open) {
              window.location.reload();
            }
          }} 
        />
      </>
    );
  }
  
  // If we don't have org ID, we can't continue
  if (!organizationId) {
    return null; // This will not render as the login dialog will be shown
  }

  // Error screen for page loading issues
  if (pageLoadError && pageId) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Error Loading Page</AlertTitle>
          <AlertDescription>
            {pageLoadError}
            <div className="mt-4 flex justify-end">
              <Button onClick={() => navigate(`/page-builder/${organizationId}`)}>
                Create New Page Instead
              </Button>
            </div>
          </AlertDescription>
        </Alert>
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
          
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-auto">
              <PageCanvas />
            </div>
            
            <SidebarContainer />
          </div>
          
          {debugMode && <DebugPanel organizationId={organizationId} pageData={initialPageData} />}
        </div>
      </div>
    </PageBuilderProvider>
  );
};

export default PageBuilder;
