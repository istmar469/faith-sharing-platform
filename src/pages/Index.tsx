
import React, { useState, useEffect } from 'react';
import { useTenantContext } from '@/components/context/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import OrgAwareLink from '@/components/routing/OrgAwareLink';
import PuckRenderer from '@/components/pagebuilder/puck/PuckRenderer';
import { Button } from '@/components/ui/button';
import { Edit, Settings, LogIn } from 'lucide-react';
import LoginDialog from '@/components/auth/LoginDialog';

interface HomepageData {
  id: string;
  title: string;
  content: any;
}

const Index = () => {
  const { isSubdomainAccess, organizationName, organizationId } = useTenantContext();
  const { isAuthenticated } = useAuthStatus();
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    const fetchHomepage = async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }

      try {
        console.log('Index: Fetching homepage for org:', organizationId);
        
        const { data: page, error } = await supabase
          .from('pages')
          .select('id, title, content')
          .eq('organization_id', organizationId)
          .eq('is_homepage', true)
          .eq('published', true)
          .maybeSingle();

        if (error) {
          console.error('Index: Error fetching homepage:', error);
        } else if (page) {
          console.log('Index: Found homepage:', page.title);
          setHomepageData(page);
        } else {
          console.log('Index: No homepage found, showing default content');
        }
      } catch (err) {
        console.error('Index: Exception fetching homepage:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomepage();
  }, [organizationId]);

  // If we have homepage data, render the custom homepage
  if (homepageData) {
    return (
      <div className="min-h-screen bg-white">
        {/* Admin bar for authenticated users */}
        {isAuthenticated && (
          <div className="bg-blue-600 text-white p-2 text-center text-sm relative">
            <span className="mr-4">You are logged in as church staff</span>
            <div className="flex gap-2 justify-center">
              <OrgAwareLink to={`/page-builder/${homepageData.id}`}>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-white border-white hover:bg-white hover:text-blue-600"
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit Page
                </Button>
              </OrgAwareLink>
              <OrgAwareLink to="/dashboard">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-white border-white hover:bg-white hover:text-blue-600"
                >
                  <Settings className="mr-1 h-3 w-3" />
                  Dashboard
                </Button>
              </OrgAwareLink>
            </div>
          </div>
        )}

        {/* Non-authenticated users get a login button */}
        {!isAuthenticated && (
          <div className="absolute top-4 right-4 z-50">
            <Button 
              onClick={() => setShowLoginDialog(true)}
              variant="outline"
              size="sm"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Staff Login
            </Button>
          </div>
        )}

        {/* Render the actual homepage content using Puck */}
        <div className="min-h-screen">
          <PuckRenderer 
            data={homepageData.content || { content: [], root: {} }}
            className="min-h-screen"
          />
        </div>

        <LoginDialog isOpen={showLoginDialog} setIsOpen={setShowLoginDialog} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Default index page for when no homepage is set
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Admin bar for authenticated users */}
      {isAuthenticated && (
        <div className="bg-blue-600 text-white p-2 text-center text-sm">
          <span className="mr-4">You are logged in as church staff</span>
          <OrgAwareLink to="/dashboard">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-white border-white hover:bg-white hover:text-blue-600"
            >
              <Settings className="mr-1 h-3 w-3" />
              Go to Dashboard
            </Button>
          </OrgAwareLink>
        </div>
      )}

      {/* Non-authenticated users get a login button */}
      {!isAuthenticated && (
        <div className="absolute top-4 right-4 z-50">
          <Button 
            onClick={() => setShowLoginDialog(true)}
            variant="outline"
            size="sm"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Staff Login
          </Button>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {isSubdomainAccess ? `Welcome to ${organizationName}` : 'Church OS'}
          </h1>
          <p className="text-xl text-gray-600">
            {isSubdomainAccess 
              ? 'Your church management system' 
              : 'Complete church management and website platform'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Page Builder</h3>
            <p className="text-gray-600 mb-4">
              Create and edit your website pages with our visual editor.
            </p>
            <OrgAwareLink
              to="/page-builder"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Open Page Builder
            </OrgAwareLink>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Dashboard</h3>
            <p className="text-gray-600 mb-4">
              Access your church management dashboard.
            </p>
            <OrgAwareLink
              to="/dashboard"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Open Dashboard
            </OrgAwareLink>
          </div>
        </div>

        <div className="text-center">
          <Button
            onClick={() => setShowLoginDialog(true)}
            variant="outline"
            className="text-blue-600 hover:text-blue-800"
          >
            Login / Sign Up
          </Button>
        </div>
      </div>

      <LoginDialog isOpen={showLoginDialog} setIsOpen={setShowLoginDialog} />
    </div>
  );
};

export default Index;
