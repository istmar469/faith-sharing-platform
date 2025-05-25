import React, { useState } from 'react';
import { ChevronDown, Menu, X, Search, User, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  target?: '_blank' | '_self';
  children?: NavigationItem[];
  isExternal?: boolean;
  isVisible?: boolean;
}

export interface EnhancedHeaderProps {
  logo?: string;
  logoText?: string;
  showNavigation?: boolean;
  navigationItems?: NavigationItem[];
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

const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({
  logo,
  logoText = 'My Organization',
  showNavigation = true,
  navigationItems = [],
  backgroundColor = 'white',
  textColor = 'gray-900',
  isSticky = true,
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
          <DropdownMenuContent>
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
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

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

  if (layout === 'centered') {
    return (
      <header className={headerClasses}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center space-y-4">
            <LogoSection />
            {showNavigation && (
              <nav className="hidden md:flex space-x-6">
                {navigationItems.map((item) => renderNavigationItem(item))}
              </nav>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between py-4">
          <LogoSection />
          
          {showNavigation && (
            <nav className="flex space-x-6">
              {navigationItems.map((item) => renderNavigationItem(item))}
            </nav>
          )}
          
          <div className="flex items-center space-x-4">
            <SearchSection />
            <CTASection />
            <UserMenuSection />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-between py-4">
          <LogoSection />
          
          <div className="flex items-center space-x-2">
            {showUserMenu && <UserMenuSection />}
            
            {showNavigation && (
              <Button
                variant="ghost"
                size="lg"
                className="p-3"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
              </Button>
            )}
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
              {navigationItems.map((item) => renderNavigationItem(item, true))}
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

export default EnhancedHeader;
