
import React from 'react';
import { Link } from 'react-router-dom';
import { SiteSettings } from '@/services/siteSettings';

interface SiteFooterProps {
  settings: SiteSettings;
  isEditing?: boolean;
}

const SiteFooter: React.FC<SiteFooterProps> = ({ settings, isEditing = false }) => {
  const { footer_config } = settings;

  if (!footer_config.show_footer && !isEditing) {
    return null;
  }

  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {footer_config.text && (
            <div className="text-gray-600 text-sm mb-4 md:mb-0">
              {footer_config.text}
            </div>
          )}

          {footer_config.links && footer_config.links.length > 0 && (
            <div className="flex space-x-6">
              {footer_config.links.map((link) => (
                <Link
                  key={link.id}
                  to={link.url}
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {isEditing && (
            <div className="text-xs text-gray-500 bg-yellow-100 px-2 py-1 rounded">
              Footer Preview
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
