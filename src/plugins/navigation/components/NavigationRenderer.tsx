
import React, { useState } from 'react';
import { NavigationSettings } from '../NavigationPlugin';
import { Menu, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationRendererProps {
  settings: NavigationSettings;
  currentPath?: string;
}

const NavigationRenderer: React.FC<NavigationRendererProps> = ({ 
  settings, 
  currentPath = '/' 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLinkClick = (path: string, isExternal?: boolean) => {
    if (isExternal) {
      window.open(path, '_blank');
    } else {
      // In a real implementation, this would use your router
      window.location.href = path;
    }
    setIsMobileMenuOpen(false);
  };

  const renderNavigationItems = (isMobile = false) => (
    <ul className={`flex ${settings.style === 'horizontal' && !isMobile ? 'space-x-6' : 'flex-col space-y-2'}`}>
      {settings.items.map((item) => (
        <li key={item.id} className="relative group">
          <button
            onClick={() => handleLinkClick(item.path, item.isExternal)}
            className={`hover:text-blue-600 transition-colors flex items-center gap-1 ${
              currentPath === item.path ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            {item.label}
            {item.isExternal && <ExternalLink className="h-3 w-3" />}
          </button>
          
          {item.children && item.children.length > 0 && (
            <ul className={`${
              isMobile 
                ? 'ml-4 mt-2' 
                : 'absolute top-full left-0 hidden group-hover:block bg-white border rounded shadow-lg py-2 min-w-48 z-50'
            }`}>
              {item.children.map((child) => (
                <li key={child.id}>
                  <button
                    onClick={() => handleLinkClick(child.path, child.isExternal)}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                      currentPath === child.path ? 'text-blue-600 font-semibold' : ''
                    }`}
                  >
                    {child.label}
                    {child.isExternal && <ExternalLink className="h-3 w-3 ml-1" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-between w-full">
        {settings.showLogo && (
          <div className="font-bold text-lg">
            {settings.logoImage ? (
              <img src={settings.logoImage} alt={settings.logoText} className="h-8" />
            ) : (
              settings.logoText
            )}
          </div>
        )}
        
        <nav>
          {renderNavigationItems()}
        </nav>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center justify-between w-full">
        {settings.showLogo && (
          <div className="font-bold text-lg">
            {settings.logoImage ? (
              <img src={settings.logoImage} alt={settings.logoText} className="h-8" />
            ) : (
              settings.logoText
            )}
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
          <nav>
            {renderNavigationItems(true)}
          </nav>
        </div>
      )}
    </>
  );
};

export default NavigationRenderer;
