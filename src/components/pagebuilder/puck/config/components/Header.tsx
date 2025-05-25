
import React from 'react';
import MobileNavigation from '@/components/navigation/MobileNavigation';

export interface HeaderProps {
  logo?: string;
  logoText?: string;
  showNavigation?: boolean;
  navigationItems?: Array<{
    label: string;
    href: string;
  }>;
  backgroundColor?: string;
  textColor?: string;
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
}) => {
  if (!showNavigation) {
    return (
      <header className={`bg-${backgroundColor} border-b`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            {logo ? (
              <img src={logo} alt={logoText} className="h-8 w-auto" />
            ) : (
              <h1 className={`text-xl font-bold text-${textColor}`}>{logoText}</h1>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`bg-${backgroundColor} border-b`}>
      <div className="container mx-auto">
        {/* Mobile Navigation */}
        <div className="md:hidden">
          <MobileNavigation
            logo={logo}
            logoText={logoText}
            items={navigationItems.map(item => ({
              ...item,
              icon: undefined,
            }))}
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between px-4 py-4">
          <div className="flex items-center">
            {logo ? (
              <img src={logo} alt={logoText} className="h-8 w-auto" />
            ) : (
              <h1 className={`text-xl font-bold text-${textColor}`}>{logoText}</h1>
            )}
          </div>
          
          <nav className="flex space-x-8">
            {navigationItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={`text-${textColor} hover:text-blue-600 transition-colors font-medium`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
