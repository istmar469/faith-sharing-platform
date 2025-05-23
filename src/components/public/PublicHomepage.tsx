
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LogIn, Settings } from 'lucide-react';
import { useTenantContext } from '@/components/context/TenantContext';
import EditorRenderer from '@/components/pagebuilder/editor/EditorRenderer';
import LoginDialog from '@/components/auth/LoginDialog';
import { useAuthStatus } from '@/hooks/useAuthStatus';

interface PageData {
  id: string;
  title: string;
  content: any;
  meta_title?: string;
  meta_description?: string;
}

const PublicHomepage: React.FC = () => {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const { organizationId, organizationName } = useTenantContext();
  const { isAuthenticated } = useAuthStatus();

  useEffect(() => {
    const fetchHomepage = async () => {
      if (!organizationId) return;

      try {
        const { data, error } = await supabase
          .from('pages')
          .select('id, title, content, meta_title, meta_description')
          .eq('organization_id', organizationId)
          .eq('is_homepage', true)
          .eq('published', true)
          .single();

        if (error) {
          console.error('Error fetching homepage:', error);
          setError('Could not load homepage content');
        } else {
          setPageData(data);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchHomepage();
  }, [organizationId]);

  // Auto-redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && pageData) {
      // Small delay to prevent flash of content
      const timer = setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, pageData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to {organizationName || 'Our Church'}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              We're excited to have you visit our website. Our homepage is currently being set up.
            </p>
            <Button onClick={() => setLoginDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <LogIn className="mr-2 h-4 w-4" />
              Church Staff Login
            </Button>
          </div>
        </div>
        <LoginDialog isOpen={loginDialogOpen} setIsOpen={setLoginDialogOpen} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Admin Bar for authenticated users */}
      {isAuthenticated && (
        <div className="bg-blue-600 text-white p-2 text-center text-sm">
          <span className="mr-4">You are logged in as church staff</span>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-white border-white hover:bg-white hover:text-blue-600"
            onClick={() => window.location.href = '/dashboard'}
          >
            <Settings className="mr-1 h-3 w-3" />
            Go to Dashboard
          </Button>
        </div>
      )}

      {/* Public Homepage Content */}
      <div className="relative">
        {/* Floating Admin Button for non-authenticated users */}
        {!isAuthenticated && (
          <div className="fixed top-4 right-4 z-50">
            <Button 
              onClick={() => setLoginDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Staff Login
            </Button>
          </div>
        )}

        {/* Page Content */}
        <div className="container mx-auto px-4 py-8">
          {pageData.title && (
            <h1 className="text-4xl font-bold text-center mb-8">{pageData.title}</h1>
          )}
          
          <div className="prose max-w-none">
            <EditorRenderer data={pageData.content} />
          </div>
        </div>
      </div>

      <LoginDialog isOpen={loginDialogOpen} setIsOpen={setLoginDialogOpen} />
    </div>
  );
};

export default PublicHomepage;
