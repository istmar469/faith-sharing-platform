
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

const PageBuilder = () => {
  const [searchParams] = useSearchParams();
  const { pageId } = useParams();
  const organizationId = searchParams.get('organization_id');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  
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
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate, toast, pageId, organizationId]);
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading page builder...</span>
      </div>
    );
  }
  
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
  
  return (
    <PageBuilderProvider>
      <div className="flex h-screen bg-gray-100">
        <SideNav />
        
        <div className="flex-1 flex flex-col">
          <PageHeader />
          
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
