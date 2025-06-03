import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';

interface NavigationItem {
  id?: string;
  label: string;
  href: string;
  target?: '_blank' | '_self';
  icon?: React.ComponentType<any>;
}

interface MobileNavigationProps {
  logo?: string;
  logoText?: string;
  items?: NavigationItem[];
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  logo,
  logoText = 'Church',
  items = [], // Default to empty array - no hard-coded navigation
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigationClick = (href: string, target?: '_blank' | '_self') => {
    if (target === '_blank') {
      window.open(href, '_blank');
    } else if (href.startsWith('#')) {
      // Handle anchor links by scrolling to element
      const element = document.getElementById(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Use React Router for internal navigation
      navigate(href);
    }
    setIsOpen(false);
  };

  return (
    <div className="flex items-center justify-between w-full p-4 bg-white border-b">
      {/* Logo */}
      <div className="flex items-center">
        {logo ? (
          <img src={logo} alt={logoText} className="h-8 w-auto" />
        ) : (
          <h1 className="text-xl font-bold text-gray-900">{logoText}</h1>
        )}
      </div>

      {/* Mobile Menu - Only show if there are navigation items */}
      {items.length > 0 && (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="flex flex-col space-y-4 mt-8">
              {items.map((item, index) => (
                <button
                  key={item.id || index}
                  onClick={() => handleNavigationClick(item.href, item.target)}
                  className="flex items-center space-x-3 text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors p-3 rounded-lg hover:bg-gray-50 w-full text-left bg-transparent border-none cursor-pointer"
                >
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default MobileNavigation;
