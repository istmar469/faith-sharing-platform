import React, { useEffect, useState } from 'react';
import { getSiteSettings, SiteSettings } from '@/services/siteSettings';
import { useLayoutSettings } from '@/hooks/useLayoutSettings';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/pagebuilder/puck/config/components/Header';
import Footer from '@/components/pagebuilder/puck/config/components/Footer';
import { Button } from '@/components/ui/button';
import { Settings, Edit, Plus } from 'lucide-react';
import LoginDialog from '@/components/auth/LoginDialog';

interface SubdomainLayoutProps {
  organizationId: string;
  children: React.ReactNode;
}

interface PageData {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  show_in_navigation: boolean;
  is_homepage: boolean;
}

const SubdomainLayout: React.FC<SubdomainLayoutProps> = ({
  organizationId,
  children
}) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<PageData[]>([]);
  const { isAuthenticated } = useAuthStatus();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const settings = await getSiteSettings(organizationId);
        setSiteSettings(settings);
      } catch (error) {
        console.error('Error fetching site settings:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPages = async () => {
      try {
        console.log('SubdomainLayout: Fetching pages for org:', organizationId);
        
        // First, let's get ALL pages to debug
        const { data: allPages, error: allError } = await supabase
          .from('pages')
          .select('id, title, slug, published, show_in_navigation, is_homepage')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: true });

        console.log('SubdomainLayout: All pages for org:', allPages);

        if (allError) {
          console.error('SubdomainLayout: Error fetching all pages:', allError);
        }

        // Then get published pages for navigation
        const { data, error } = await supabase
          .from('pages')
          .select('id, title, slug, published, show_in_navigation, is_homepage')
          .eq('organization_id', organizationId)
          .eq('published', true)
          .eq('show_in_navigation', true)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('SubdomainLayout: Error fetching navigation pages:', error);
          throw error;
        }
        
        console.log('SubdomainLayout: Navigation pages:', data);
        setPages(data || []);
      } catch (error) {
        console.error('Error fetching pages:', error);
        setPages([]); // Set empty array on error to prevent crashes
      }
    };

    if (organizationId) {
      fetchSiteSettings();
      fetchPages();

      // Set up real-time subscription for pages
      const subscription = supabase
        .channel(`pages_${organizationId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'pages',
            filter: `organization_id=eq.${organizationId}`
          },
          (payload) => {
            console.log('Page change detected:', payload);
            // Refetch pages when there are changes
            fetchPages();
          }
        )
        .subscribe();

      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [organizationId]);

  // Toggle debug mode with keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        setDebugMode(!debugMode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [debugMode]);

  // Default settings when none are configured
  const getDefaultSettings = (): Partial<SiteSettings> => ({
    site_title: 'My Church',
    header_config: {
      show_navigation: true,
      navigation: []
    },
    footer_config: {
      show_footer: true,
      text: '© 2024 All rights reserved.'
    },
    theme_config: {
      primary_color: '#3b82f6',
      secondary_color: '#64748b'
    },
    layout_config: {
      content_width: 'boxed',
      max_content_width: '1200px',
      container_padding: '1rem',
      enable_animations: true
    }
  });

  const settings = siteSettings || getDefaultSettings();
  const { getContainerClasses, getContentClasses, isFullWidth } = useLayoutSettings(settings as SiteSettings);

  // Create navigation items from fetched pages
  const navigationItems = pages.map(page => ({
    id: page.id,
    label: page.title,
    href: page.is_homepage ? '/' : `/${page.slug}`,
    target: '_self' as '_self',
    isExternal: false,
    isVisible: true
  }));

  const handleManagePages = () => {
    window.location.href = `/page-builder?organization_id=${organizationId}`;
  };

  const handleCreateNewPage = () => {
    window.location.href = `/page-builder/new?organization_id=${organizationId}`;
  };

  const handleDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleDebugPages = () => {
    // Create a simple homepage if none exists
    const createHomepage = async () => {
      try {
        const { data, error } = await supabase
          .from('pages')
          .insert([{
            organization_id: organizationId,
            title: 'Homepage',
            slug: 'home',
            is_homepage: true,
            published: true,
            show_in_navigation: true,
            content: {
              content: [
                {
                  type: "Hero",
                  props: {
                    title: settings.site_title || "Welcome to Our Church",
                    subtitle: "Building community through faith and fellowship",
                    primaryButtonText: "Learn More",
                    primaryButtonLink: "#about"
                  }
                }
              ],
              root: { props: {} }
            }
          }]);

        if (error) throw error;
        console.log('Emergency homepage created');
        window.location.reload();
      } catch (err) {
        console.error('Failed to create homepage:', err);
      }
    };

    if (confirm('Create an emergency homepage to test the system?')) {
      createHomepage();
    }
  };

  const handleEmergencyLogin = () => {
    setShowLoginDialog(true);
  };

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

  // Convert site settings to Header props
  const headerProps = {
    logoText: settings.site_title || 'Welcome',
    logo: settings.logo_url,
    showNavigation: settings.header_config?.show_navigation !== false,
    navigationItems: navigationItems,
    backgroundColor: 'white',
    textColor: 'gray-900',
    isSticky: true,
    maxWidth: (isFullWidth ? 'full' : 'container') as 'full' | 'container' | 'lg' | 'xl' | '2xl',
    enablePageManagement: false, // Disable built-in page management
    organizationBranding: {
      primaryColor: settings.theme_config?.primary_color,
      secondaryColor: settings.theme_config?.secondary_color,
      fontFamily: settings.theme_config?.font_family
    }
  };

  // Convert site settings to Footer props
  const footerProps = {
    layout: 'enhanced' as const,
    showFooter: settings.footer_config?.show_footer !== false,
    companyName: settings.site_title || 'Our Organization',
    backgroundColor: 'gray-900',
    textColor: 'white',
    text: settings.footer_config?.text,
    sections: settings.footer_config?.links ? [{
      id: 'main',
      title: 'Quick Links',
      links: settings.footer_config.links.map(link => ({
        id: link.id,
        label: link.label,
        href: link.url,
        target: '_self' as '_self',
        isExternal: link.url?.startsWith('http')
      }))
    }] : [],
    organizationBranding: {
      primaryColor: settings.theme_config?.primary_color,
      secondaryColor: settings.theme_config?.secondary_color,
      fontFamily: settings.theme_config?.font_family
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Global Admin Header for Authenticated Users */}
      {isAuthenticated && (
        <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <Settings className="h-4 w-4" />
            <span>Admin Dashboard</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300">{settings.site_title}</span>
            {pages.length > 0 ? (
              <>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300">{pages.length} published page{pages.length !== 1 ? 's' : ''}</span>
              </>
            ) : (
              <>
                <span className="text-slate-400">•</span>
                <span className="text-red-300">No pages in navigation</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {pages.length === 0 && (
              <Button 
                size="sm"
                variant="secondary"
                onClick={handleDebugPages}
                className="flex items-center gap-1 bg-red-600 text-white hover:bg-red-700 border-red-600"
              >
                <Plus className="h-3 w-3" />
                Emergency Homepage
              </Button>
            )}
            <Button 
              size="sm"
              variant="secondary"
              onClick={handleCreateNewPage}
              className="flex items-center gap-1 bg-green-600 text-white hover:bg-green-700 border-green-600"
            >
              <Plus className="h-3 w-3" />
              New Page
            </Button>
            <Button 
              size="sm"
              variant="secondary"
              onClick={handleDashboard}
              className="flex items-center gap-1 bg-slate-700 text-white hover:bg-slate-600 border-slate-600"
            >
              <Settings className="h-3 w-3" />
              Dashboard
            </Button>
            <Button 
              size="sm"
              variant="secondary"
              onClick={handleManagePages}
              className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
            >
              <Edit className="h-3 w-3" />
              Manage Pages
            </Button>
          </div>
        </div>
      )}

      {/* Debug Panel */}
      {debugMode && (
        <div className="bg-yellow-100 border-b border-yellow-300 p-3 text-sm">
          <div className="font-bold mb-2">🐛 Debug Info (Ctrl+Shift+D to toggle)</div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <strong>Authentication:</strong> {isAuthenticated ? '✅ Logged in' : '❌ Not logged in'}
            </div>
            <div>
              <strong>Organization ID:</strong> {organizationId}
            </div>
            <div>
              <strong>Current URL:</strong> {window.location.href}
            </div>
            <div>
              <strong>Pages Found:</strong> {pages.length}
            </div>
            <div>
              <strong>Navigation Items:</strong> {pages.filter(p => p.show_in_navigation).length}
            </div>
            <div>
              <strong>Published Pages:</strong> {pages.filter(p => p.published).length}
            </div>
          </div>
          {!isAuthenticated && (
            <div className="mt-2">
              <Button 
                onClick={handleEmergencyLogin}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                🚨 Emergency Login
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Site Header */}
      <Header {...headerProps} />
      
      <main className={`flex-1 ${getContentClasses()}`}>
        <div className={isFullWidth ? 'w-full' : getContainerClasses()}>
          {children}
        </div>
      </main>
      <Footer {...footerProps} />

      {/* Login Dialog */}
      <LoginDialog 
        isOpen={showLoginDialog} 
        setIsOpen={setShowLoginDialog} 
      />
    </div>
  );
};

export default SubdomainLayout;
