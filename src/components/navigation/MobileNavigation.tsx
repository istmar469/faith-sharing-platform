
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, Home, Calendar, Phone, Mail } from 'lucide-react';

interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ComponentType<any>;
}

interface MobileNavigationProps {
  logo?: string;
  logoText?: string;
  items?: NavigationItem[];
}

const defaultItems: NavigationItem[] = [
  { label: 'Home', href: '#', icon: Home },
  { label: 'Services', href: '#service-times', icon: Calendar },
  { label: 'Contact', href: '#contact', icon: Phone },
  { label: 'About', href: '#about', icon: Mail },
];

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  logo,
  logoText = 'Church',
  items = defaultItems,
}) => {
  const [isOpen, setIsOpen] = useState(false);

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

      {/* Mobile Menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-72">
          <div className="flex flex-col space-y-4 mt-8">
            {items.map((item, index) => (
              <a
                key={index}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors p-3 rounded-lg hover:bg-gray-50"
              >
                {item.icon && <item.icon className="h-5 w-5" />}
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNavigation;
