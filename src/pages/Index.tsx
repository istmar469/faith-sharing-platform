import React, { useState, useEffect } from 'react';
import { useTenantContext } from '@/components/context/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import OrgAwareLink from '@/components/routing/OrgAwareLink';
import PuckRenderer from '@/components/pagebuilder/puck/PuckRenderer';
import PublicHomepage from '@/components/public/PublicHomepage';
import FloatingAdminButton from '@/components/admin/FloatingAdminButton';
import { Button } from '@/components/ui/button';
import { Edit, Settings, LogIn, X, Plus } from 'lucide-react';
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
  const [adminBarDismissed, setAdminBarDismissed] = useState(() => {
    return localStorage.getItem('adminBarDismissed') === 'true';
  });

  useEffect(() => {
    const fetchHomepage = async () => {
      // Only fetch homepage data for subdomains
      if (!isSubdomainAccess || !organizationId) {
        setLoading(false);
        return;
      }

      try {
        console.log('Index: Fetching homepage for subdomain org:', organizationId);
        
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
          console.log('Index: No published homepage found for subdomain');
        }
      } catch (err) {
        console.error('Index: Exception fetching homepage:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomepage();
  }, [organizationId, isSubdomainAccess]);

  const handleDismissAdminBar = () => {
    setAdminBarDismissed(true);
    localStorage.setItem('adminBarDismissed', 'true');
  };

  const handleShowAdminBar = () => {
    setAdminBarDismissed(false);
    localStorage.setItem('adminBarDismissed', 'false');
  };

  // Keyboard shortcut to toggle admin bar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        if (isAuthenticated) {
          setAdminBarDismissed(!adminBarDismissed);
          localStorage.setItem('adminBarDismissed', (!adminBarDismissed).toString());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, adminBarDismissed]);

  // For root domain - always show the original Church OS landing page
  if (!isSubdomainAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Admin bar for authenticated users on root domain */}
        {isAuthenticated && !adminBarDismissed && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-gray-700 font-medium">Staff Mode</span>
              <div className="flex items-center gap-2">
                <OrgAwareLink to="/dashboard">
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-8"
                  >
                    <Settings className="mr-1 h-3 w-3" />
                    Dashboard
                  </Button>
                </OrgAwareLink>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismissAdminBar}
                  className="text-gray-500 hover:text-gray-700 p-1 h-8 w-8"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Floating admin button when bar is dismissed */}
        {isAuthenticated && adminBarDismissed && (
          <FloatingAdminButton onShowAdminBar={handleShowAdminBar} />
        )}

        {/* Non-authenticated users get a login button */}
        {!isAuthenticated && (
          <div className="fixed top-4 right-4 z-50">
            <Button 
              onClick={() => setShowLoginDialog(true)}
              variant="outline"
              size="sm"
              className="bg-white/95 backdrop-blur-sm border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Staff Login
            </Button>
          </div>
        )}

        <div className={`max-w-4xl mx-auto px-6 py-16 ${isAuthenticated && !adminBarDismissed ? 'pt-24' : ''}`}>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Church OS</h1>
            <p className="text-xl text-gray-600">
              Complete church management and website platform
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
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Login / Sign Up
            </Button>
          </div>
        </div>

        <LoginDialog isOpen={showLoginDialog} setIsOpen={setShowLoginDialog} />
      </div>
    );
  }

  // For subdomains - handle loading state
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

  // For subdomains with published homepage - show Puck content
  if (homepageData) {
    return (
      <div className="min-h-screen bg-white">
        {/* Admin overlay for authenticated users on subdomains */}
        {isAuthenticated && !adminBarDismissed && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-gray-700 font-medium">Staff Mode</span>
              <div className="flex items-center gap-2">
                <OrgAwareLink to={`/page-builder/${homepageData.id}`}>
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-8"
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit Site
                  </Button>
                </OrgAwareLink>
                <OrgAwareLink to="/dashboard">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs px-3 py-1 h-8"
                  >
                    <Settings className="mr-1 h-3 w-3" />
                    Dashboard
                  </Button>
                </OrgAwareLink>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismissAdminBar}
                  className="text-gray-500 hover:text-gray-700 p-1 h-8 w-8"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Floating admin button when bar is dismissed */}
        {isAuthenticated && adminBarDismissed && (
          <FloatingAdminButton onShowAdminBar={handleShowAdminBar} />
        )}

        {/* Non-authenticated users get a login button */}
        {!isAuthenticated && (
          <div className="fixed top-4 right-4 z-50">
            <Button 
              onClick={() => setShowLoginDialog(true)}
              variant="outline"
              size="sm"
              className="bg-white/95 backdrop-blur-sm border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Staff Login
            </Button>
          </div>
        )}

        {/* Render the Puck homepage content */}
        <div className={`min-h-screen ${isAuthenticated && !adminBarDismissed ? 'pt-12' : ''}`}>
          <PuckRenderer 
            data={homepageData.content || { content: [], root: {} }}
            className="min-h-screen"
          />
        </div>

        <LoginDialog isOpen={showLoginDialog} setIsOpen={setShowLoginDialog} />
      </div>
    );
  }

  // For subdomains without published homepage - show PublicHomepage with admin overlay
  return (
    <div className="min-h-screen bg-white relative">
      {/* Admin overlay for authenticated users on subdomains without homepage */}
      {isAuthenticated && !adminBarDismissed && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm text-gray-700 font-medium">Staff Mode</span>
            <div className="flex items-center gap-2">
              <OrgAwareLink to="/page-builder">
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-8"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Create Homepage
                </Button>
              </OrgAwareLink>
              <OrgAwareLink to="/dashboard">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs px-3 py-1 h-8"
                >
                  <Settings className="mr-1 h-3 w-3" />
                  Dashboard
                </Button>
              </OrgAwareLink>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismissAdminBar}
                className="text-gray-500 hover:text-gray-700 p-1 h-8 w-8"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating admin button when bar is dismissed */}
      {isAuthenticated && adminBarDismissed && (
        <FloatingAdminButton onShowAdminBar={handleShowAdminBar} />
      )}

      {/* PublicHomepage component with admin bar offset */}
      <div className={isAuthenticated && !adminBarDismissed ? 'pt-12' : ''}>
        <PublicHomepage />
      </div>

      <LoginDialog isOpen={showLoginDialog} setIsOpen={setShowLoginDialog} />
    </div>
  );
};

export default Index;
