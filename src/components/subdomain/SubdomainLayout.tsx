import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Search, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import UserSessionIndicator from '@/components/auth/UserSessionIndicator';

interface SubdomainLayoutProps {
  children: React.ReactNode;
  organizationId: string;
}

interface NavigationItem {
  id: string;
  label: string;
  url: string;
  target: '_self' | '_blank';
  order: number;
}

interface SiteSettings {
  site_title?: string;
  logo_url?: string;
  header_config?: any;
  footer_config?: any;
}

const SubdomainLayout: React.FC<SubdomainLayoutProps> = ({ children, organizationId }) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadSiteSettings();
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [organizationId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('site_title, logo_url, header_config, footer_config')
        .eq('organization_id', organizationId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading site settings:', error);
        return;
      }

      setSiteSettings(data || {});
    } catch (error) {
      console.error('Error loading site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleDashboard = () => {
    window.location.href = `/dashboard/${organizationId}`;
  };

  if (loading) {
    return <div>{children}</div>;
  }

  const headerConfig = (siteSettings.header_config as any) || {};
  const footerConfig = (siteSettings.footer_config as any) || {};
  const navigation: NavigationItem[] = headerConfig.navigation || [];
  const showHeader = headerConfig.show_header !== false;
  const showFooter = footerConfig.show_footer !== false;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      {showHeader && (
        <header 
          className="border-b"
          style={{ 
            backgroundColor: headerConfig.background_color || '#ffffff',
            color: headerConfig.text_color || '#000000'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo/Title */}
              <div className="flex items-center">
                {siteSettings.logo_url ? (
                  <img 
                    src={siteSettings.logo_url} 
                    alt={siteSettings.site_title || 'Logo'} 
                    className="h-8 w-auto mr-3"
                  />
                ) : null}
                <Link 
                  to="/" 
                  className="text-xl font-bold"
                  style={{ color: headerConfig.text_color || '#000000' }}
                >
                  {siteSettings.site_title || 'Site'}
                </Link>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex space-x-6">
                {navigation
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <Link
                      key={item.id}
                      to={item.url}
                      target={item.target}
                      className="hover:opacity-75 transition-opacity"
                      style={{ color: headerConfig.text_color || '#000000' }}
                    >
                      {item.label}
                    </Link>
                  ))
                }
              </nav>

              {/* Right section with search and user actions */}
              <div className="flex items-center gap-4">
                {/* Search */}
                {headerConfig.show_search && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="pl-10 w-64"
                    />
                  </div>
                )}

                {/* Manage Pages Button - Only show for logged in users */}
                {user && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDashboard}
                    className="text-sm"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Pages
                  </Button>
                )}

                {/* User Session Indicator */}
                <UserSessionIndicator variant="header" />
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden pb-4">
              <nav className="flex flex-col space-y-2">
                {navigation
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <Link
                      key={item.id}
                      to={item.url}
                      target={item.target}
                      className="block py-2 hover:opacity-75 transition-opacity"
                      style={{ color: headerConfig.text_color || '#000000' }}
                    >
                      {item.label}
                    </Link>
                  ))
                }
              </nav>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      {showFooter && (
        <footer 
          className="border-t mt-auto"
          style={{ 
            backgroundColor: footerConfig.background_color || '#f8f9fa',
            color: footerConfig.text_color || '#6b7280'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Footer Text */}
              {footerConfig.text && (
                <div className="md:col-span-2">
                  <p className="text-sm">
                    {footerConfig.text}
                  </p>
                </div>
              )}

              {/* Footer Links */}
              {footerConfig.links && footerConfig.links.length > 0 && (
                <div>
                  <nav className="flex flex-wrap gap-4">
                    {footerConfig.links.map((link: any) => (
                      <a
                        key={link.id}
                        href={link.url}
                        className="text-sm hover:opacity-75 transition-opacity"
                        style={{ color: footerConfig.text_color || '#6b7280' }}
                      >
                        {link.label}
                      </a>
                    ))}
                  </nav>
                </div>
              )}
            </div>

            {/* Copyright */}
            {footerConfig.copyright_text && (
              <div className="border-t mt-8 pt-8">
                <p className="text-xs text-center">
                  {footerConfig.copyright_text}
                </p>
              </div>
            )}
          </div>
        </footer>
      )}
    </div>
  );
};

export default SubdomainLayout;
