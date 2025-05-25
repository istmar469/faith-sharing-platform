
import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

export interface FooterProps {
  showFooter?: boolean;
  companyName?: string;
  address?: string;
  phone?: string;
  email?: string;
  links?: Array<{
    label: string;
    href: string;
  }>;
  backgroundColor?: string;
  textColor?: string;
}

const Footer: React.FC<FooterProps> = ({
  showFooter = true,
  companyName = 'Our Church',
  address = '123 Church Street, City, State 12345',
  phone = '(555) 123-4567',
  email = 'info@church.com',
  links = [
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Contact', href: '#contact' },
  ],
  backgroundColor = 'gray-900',
  textColor = 'white',
}) => {
  if (!showFooter) {
    return null;
  }

  return (
    <footer className={`bg-${backgroundColor} text-${textColor}`}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{companyName}</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{address}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{phone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{email}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="block text-sm hover:text-blue-300 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Visit Us</h3>
            <p className="text-sm mb-4">
              Join us for worship and fellowship. Everyone is welcome!
            </p>
            <div className="text-sm">
              <p className="font-medium">Service Times:</p>
              <p>Sunday: 9:00 AM & 11:00 AM</p>
              <p>Wednesday: 7:00 PM</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} {companyName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
