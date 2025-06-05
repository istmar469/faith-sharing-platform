
import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UserSessionIndicator from '@/components/auth/UserSessionIndicator';
import { useState } from 'react';

interface NavigationItem {
  id: string;
  label: string;
  url: string;
  target: '_self' | '_blank';
  order: number;
}

interface HeaderConfig {
  show_header?: boolean;
  show_navigation?: boolean;
  background_color?: string;
  text_color?: string;
  navigation?: NavigationItem[];
  show_search?: boolean;
}

interface SiteSettings {
  site_title?: string;
  logo_url?: string;
  header_config?: HeaderConfig;
}

interface EnhancedSubdomainHeaderProps {
  siteSettings: SiteSettings;
  organizationId: string;
  user: any;
  onDashboard: () => void;
}

const EnhancedSubdomainHeader: React.FC<EnhancedSubdomainHeaderProps> = ({
  siteSettings,
  organizationId,
  user,
  onDashboard
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const headerConfig = siteSettings.header_config || {};
  const navigation: NavigationItem[] = headerConfig.navigation || [];
  
  // Don't render if header is disabled
  if (headerConfig.show_header === false) {
    return null;
  }

  const headerStyle = {
    backgroundColor: headerConfig.background_color || '#ffffff',
    color: headerConfig.text_color || '#1f2937'
  };

  const linkStyle = {
    color: headerConfig.text_color || '#1f2937'
  };

  return (
    <header className="border-b shadow-sm sticky top-0 z-50" style={headerStyle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title Section */}
          <div className="flex items-center">
            {siteSettings.logo_url ? (
              <Link to="/" className="flex items-center">
                <img 
                  src={siteSettings.logo_url} 
                  alt={siteSettings.site_title || 'Logo'} 
                  className="h-8 w-auto mr-3"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="text-xl font-bold" style={linkStyle}>
                  {siteSettings.site_title}
                </span>
              </Link>
            ) : (
              <Link 
                to="/" 
                className="text-xl font-bold hover:opacity-75 transition-opacity"
                style={linkStyle}
              >
                {siteSettings.site_title || 'Website'}
              </Link>
            )}
          </div>

          {/* Desktop Navigation */}
          {headerConfig.show_navigation && navigation.length > 0 && (
            <nav className="hidden md:flex space-x-8">
              {navigation
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                  <Link
                    key={item.id}
                    to={item.url}
                    target={item.target}
                    className="hover:opacity-75 transition-opacity font-medium"
                    style={linkStyle}
                  >
                    {item.label}
                  </Link>
                ))
              }
            </nav>
          )}

          {/* Right section with search and user actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            {headerConfig.show_search && (
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-10 w-64"
                />
              </div>
            )}

            {/* Dashboard Button - Only show for logged in users */}
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDashboard}
                className="text-sm"
                style={{ 
                  borderColor: headerConfig.text_color || '#1f2937',
                  color: headerConfig.text_color || '#1f2937'
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </Button>
            )}

            {/* User Session Indicator */}
            <UserSessionIndicator variant="header" />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ color: headerConfig.text_color || '#1f2937' }}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && headerConfig.show_navigation && navigation.length > 0 && (
          <div className="md:hidden pb-4 border-t" style={{ borderColor: headerConfig.text_color + '20' }}>
            <nav className="flex flex-col space-y-2 pt-4">
              {navigation
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                  <Link
                    key={item.id}
                    to={item.url}
                    target={item.target}
                    className="block py-2 hover:opacity-75 transition-opacity font-medium"
                    style={linkStyle}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))
              }
              
              {/* Mobile Search */}
              {headerConfig.show_search && (
                <div className="relative pt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-10 w-full"
                  />
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default EnhancedSubdomainHeader;
