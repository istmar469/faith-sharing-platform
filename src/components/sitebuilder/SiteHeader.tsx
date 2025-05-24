
import React from 'react';
import { Link } from 'react-router-dom';
import { SiteSettings } from '@/services/siteSettings';

interface SiteHeaderProps {
  settings: SiteSettings;
  isEditing?: boolean;
}

const SiteHeader: React.FC<SiteHeaderProps> = ({ settings, isEditing = false }) => {
  const { header_config, site_title } = settings;

  if (!header_config.show_navigation && !isEditing) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Site Title */}
          <div className="flex items-center">
            {header_config.logo ? (
              <img src={header_config.logo} alt={site_title} className="h-8 w-auto" />
            ) : (
              <h1 className="text-xl font-bold text-gray-900">{site_title}</h1>
            )}
          </div>

          {/* Navigation */}
          {header_config.navigation && header_config.navigation.length > 0 && (
            <nav className="hidden md:flex space-x-8">
              {header_config.navigation.map((item) => (
                <Link
                  key={item.id}
                  to={item.url}
                  target={item.target}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {isEditing && (
            <div className="text-xs text-gray-500 bg-yellow-100 px-2 py-1 rounded">
              Header Preview
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
