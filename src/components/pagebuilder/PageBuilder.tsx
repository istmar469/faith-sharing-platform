
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

const PageBuilder = () => {
  const [searchParams] = useSearchParams();
  const { pageId } = useParams();
  const organizationId = searchParams.get('organization_id');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
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
        navigate("/login");
        return;
      }
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "You need to be logged in to use the page builder.",
          variant: "destructive"
        });
        navigate("/login");
        return;
      }
      
      // User is authenticated
      setIsAuthenticated(true);
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate, toast]);
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading page builder...</span>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // This will not render as the user will be redirected
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
