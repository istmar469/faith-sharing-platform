
import React, { useState } from 'react';
import { ComponentConfig } from '@measured/puck';
import { ChevronDown, Menu, X, Search, User, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import MobileNavigation from '@/components/navigation/MobileNavigation';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  target?: '_blank' | '_self';
  children?: NavigationItem[];
  isExternal?: boolean;
  isVisible?: boolean;
}

export interface HeaderProps {
  logo?: string;
  logoText?: string;
  showNavigation?: boolean;
  navigationItems?: Array<{
    label: string;
    href: string;
  }> | NavigationItem[];
  backgroundColor?: string;
  textColor?: string;
  isSticky?: boolean;
  showCTA?: boolean;
  ctaText?: string;
  ctaLink?: string;
  showSearch?: boolean;
  showUserMenu?: boolean;
  layout?: 'default' | 'centered' | 'minimal';
  organizationBranding?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
}

const Header: React.FC<HeaderProps> = ({
  logo,
  logoText = 'Welcome',
  showNavigation = true,
  navigationItems = [
    { label: 'Home', href: '#' },
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Contact', href: '#contact' },
  ],
  backgroundColor = 'white',
  textColor = 'gray-900',
  isSticky = false,
  showCTA = false,
  ctaText = 'Get Started',
  ctaLink = '#',
  showSearch = false,
  showUserMenu = false,
  layout = 'default',
  organizationBranding = {}
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const headerClasses = `
    ${isSticky ? 'sticky top-0 z-50' : ''} 
    bg-${backgroundColor} 
    text-${textColor} 
    border-b border-gray-200 
    shadow-sm
  `;

  // Normalize navigation items to support both formats
  const normalizedNavItems: NavigationItem[] = navigationItems.map((item, index) => {
    if ('id' in item) {
      return item as NavigationItem;
    }
    return {
      id: `nav-${index}`,
      label: item.label,
      href: item.href,
      target: '_self'
    };
  });

  const renderNavigationItem = (item: NavigationItem, isMobile = false) => {
    if (item.children && item.children.length > 0) {
      return (
        <DropdownMenu key={item.id}>
          <DropdownMenuTrigger asChild>
            <button 
              className={`
                flex items-center gap-1 px-3 py-2 
                hover:text-blue-600 transition-colors font-medium
                ${isMobile ? 'w-full justify-between' : ''}
              `}
            >
              {item.label}
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white z-50">
            {item.children.map((child) => (
              <DropdownMenuItem key={child.id}>
                <a
                  href={child.href}
                  target={child.target || '_self'}
                  className="w-full"
                >
                  {child.label}
                  {child.isExternal && <Globe className="h-3 w-3 ml-2 inline" />}
                </a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <a
        key={item.id}
        href={item.href}
        target={item.target || '_self'}
        className={`
          px-3 py-2 hover:text-blue-600 transition-colors font-medium
          ${isMobile ? 'block w-full' : 'inline-block'}
        `}
      >
        {item.label}
        {item.isExternal && <Globe className="h-3 w-3 ml-2 inline" />}
      </a>
    );
  };

  const LogoSection = () => (
    <div className="flex items-center">
      {logo ? (
        <img src={logo} alt={logoText} className="h-8 w-auto" />
      ) : (
        <h1 
          className={`text-xl font-bold text-${textColor}`}
          style={{ 
            color: organizationBranding.primaryColor,
            fontFamily: organizationBranding.fontFamily 
          }}
        >
          {logoText}
        </h1>
      )}
    </div>
  );

  const SearchSection = () => {
    if (!showSearch) return null;
    
    return (
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  };

  const CTASection = () => {
    if (!showCTA) return null;
    
    return (
      <Button 
        asChild
        style={{ backgroundColor: organizationBranding.primaryColor }}
        className="hidden md:inline-flex"
      >
        <a href={ctaLink}>{ctaText}</a>
      </Button>
    );
  };

  const UserMenuSection = () => {
    if (!showUserMenu) return null;
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white z-50">
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Simple header without navigation
  if (!showNavigation) {
    return (
      <header className={headerClasses}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <LogoSection />
          </div>
        </div>
      </header>
    );
  }

  // Minimal layout
  if (layout === 'minimal') {
    return (
      <header className={headerClasses}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <LogoSection />
          </div>
        </div>
      </header>
    );
  }

  // Centered layout
  if (layout === 'centered') {
    return (
      <header className={headerClasses}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center space-y-4">
            <LogoSection />
            {showNavigation && (
              <nav className="hidden md:flex space-x-6">
                {normalizedNavItems.map((item) => renderNavigationItem(item))}
              </nav>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Default layout
  return (
    <header className={headerClasses}>
      <div className="container mx-auto">
        {/* Mobile Navigation */}
        <div className="md:hidden">
          <MobileNavigation
            logo={logo}
            logoText={logoText}
            items={normalizedNavItems.map(item => ({
              ...item,
              icon: undefined,
            }))}
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between px-4 py-4">
          <LogoSection />
          
          {showNavigation && (
            <nav className="flex space-x-6">
              {normalizedNavItems.map((item) => renderNavigationItem(item))}
            </nav>
          )}
          
          <div className="flex items-center space-x-4">
            <SearchSection />
            <CTASection />
            <UserMenuSection />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && showNavigation && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            {showSearch && (
              <div className="pb-4">
                <SearchSection />
              </div>
            )}
            
            <nav className="space-y-2">
              {normalizedNavItems.map((item) => renderNavigationItem(item, true))}
            </nav>
            
            {showCTA && (
              <div className="pt-4">
                <Button 
                  asChild 
                  className="w-full"
                  style={{ backgroundColor: organizationBranding.primaryColor }}
                >
                  <a href={ctaLink}>{ctaText}</a>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export const headerConfig: ComponentConfig<HeaderProps> = {
  fields: {
    logo: {
      type: 'text',
      label: 'Logo URL'
    },
    logoText: {
      type: 'text',
      label: 'Logo Text'
    },
    showNavigation: {
      type: 'radio',
      label: 'Show Navigation',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    backgroundColor: {
      type: 'text',
      label: 'Background Color'
    },
    textColor: {
      type: 'text',
      label: 'Text Color'
    },
    isSticky: {
      type: 'radio',
      label: 'Sticky Header',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    showCTA: {
      type: 'radio',
      label: 'Show CTA Button',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    ctaText: {
      type: 'text',
      label: 'CTA Text'
    },
    ctaLink: {
      type: 'text',
      label: 'CTA Link'
    },
    showSearch: {
      type: 'radio',
      label: 'Show Search',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    showUserMenu: {
      type: 'radio',
      label: 'Show User Menu',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    layout: {
      type: 'select',
      label: 'Layout',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Centered', value: 'centered' },
        { label: 'Minimal', value: 'minimal' }
      ]
    }
  },
  render: (props) => <Header {...props} />
};

export default Header;
