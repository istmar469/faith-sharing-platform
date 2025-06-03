import React, { useEffect, useState } from 'react';
import { getSiteSettings, SiteSettings } from '@/services/siteSettings';
import { useLayoutSettings } from '@/hooks/useLayoutSettings';
import Header from '@/components/pagebuilder/puck/config/components/Header';
import Footer from '@/components/pagebuilder/puck/config/components/Footer';

interface SubdomainLayoutProps {
  organizationId: string;
  children: React.ReactNode;
}

const SubdomainLayout: React.FC<SubdomainLayoutProps> = ({
  organizationId,
  children
}) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

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

    if (organizationId) {
      fetchSiteSettings();
    }
  }, [organizationId]);

  // Default settings when none are configured
  const getDefaultSettings = (): Partial<SiteSettings> => ({
    site_title: 'My Church',
    header_config: {
      show_navigation: false,
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
    navigationItems: settings.header_config?.navigation?.map(item => ({
      id: item.id,
      label: item.label,
      href: item.url,
      target: (item.target === '_blank' ? '_blank' : '_self') as '_blank' | '_self',
      isExternal: item.url?.startsWith('http'),
      isVisible: true
    })) || [],
    backgroundColor: 'white',
    textColor: 'gray-900',
    isSticky: true,
    maxWidth: (isFullWidth ? 'full' : 'container') as 'full' | 'container' | 'lg' | 'xl' | '2xl',
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
      <Header {...headerProps} />
      <main className={`flex-1 ${getContentClasses()}`}>
        <div className={isFullWidth ? 'w-full' : getContainerClasses()}>
          {children}
        </div>
      </main>
      <Footer {...footerProps} />
    </div>
  );
};

export default SubdomainLayout;
