
import React, { useEffect, useState } from 'react';
import { getSiteSettings, SiteSettings } from '@/services/siteSettings';
import EnhancedHeader from '@/components/pagebuilder/puck/config/components/EnhancedHeader';
import EnhancedFooter from '@/components/pagebuilder/puck/config/components/EnhancedFooter';

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
    site_title: 'Welcome',
    header_config: {
      show_navigation: true,
      navigation: [
        { id: '1', label: 'Home', url: '/' },
        { id: '2', label: 'About', url: '/about' },
        { id: '3', label: 'Contact', url: '/contact' }
      ]
    },
    footer_config: {
      show_footer: true,
      text: '© 2024 All rights reserved.'
    },
    theme_config: {
      primary_color: '#3b82f6',
      secondary_color: '#64748b'
    }
  });

  const settings = siteSettings || getDefaultSettings();

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

  // Convert site settings to EnhancedHeader props
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
    organizationBranding: {
      primaryColor: settings.theme_config?.primary_color,
      secondaryColor: settings.theme_config?.secondary_color,
      fontFamily: settings.theme_config?.font_family
    }
  };

  // Convert site settings to EnhancedFooter props
  const footerProps = {
    showFooter: settings.footer_config?.show_footer !== false,
    companyName: settings.site_title || 'Our Organization',
    backgroundColor: 'gray-900',
    textColor: 'white',
    copyrightText: settings.footer_config?.text,
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
      <EnhancedHeader {...headerProps} />
      <main className="flex-1">
        {children}
      </main>
      <EnhancedFooter {...footerProps} />
    </div>
  );
};

export default SubdomainLayout;
