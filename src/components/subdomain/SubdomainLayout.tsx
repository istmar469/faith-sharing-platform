
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import UserSessionIndicator from '@/components/auth/UserSessionIndicator';
import FloatingEditButton from '@/components/pagebuilder/FloatingEditButton';
import SmartNavigation from '@/components/navigation/SmartNavigation';

interface SubdomainLayoutProps {
  children: React.ReactNode;
  organizationId: string;
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

  const handleDashboard = () => {
    window.location.href = `/dashboard/${organizationId}`;
  };

  if (loading) {
    return <div>{children}</div>;
  }

  const footerConfig = (siteSettings.footer_config as any) || {};
  const showFooter = footerConfig.show_footer !== false;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Smart Navigation Header */}
      <SmartNavigation
        organizationId={organizationId}
        siteTitle={siteSettings.site_title}
        logoUrl={siteSettings.logo_url}
        showSearch={(siteSettings.header_config as any)?.show_search}
        showUserMenu={true}
        backgroundColor={(siteSettings.header_config as any)?.background_color}
        textColor={(siteSettings.header_config as any)?.text_color}
        user={user}
        onDashboard={handleDashboard}
      />

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

      {/* Floating Edit Button for authenticated users */}
      <FloatingEditButton />
    </div>
  );
};

export default SubdomainLayout;
