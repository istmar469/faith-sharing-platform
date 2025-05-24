
import React from 'react';
import { Monitor, Smartphone, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavigationSettings } from '../NavigationPlugin';

interface NavigationPreviewTabProps {
  settings: NavigationSettings;
  previewMode: 'desktop' | 'mobile';
  onSetPreviewMode: (mode: 'desktop' | 'mobile') => void;
}

const NavigationPreviewTab: React.FC<NavigationPreviewTabProps> = ({
  settings,
  previewMode,
  onSetPreviewMode
}) => {
  const renderNavigationPreview = () => {
    const isMobile = previewMode === 'mobile';
    
    return (
      <div className={`border rounded-lg p-4 ${isMobile ? 'w-80' : 'w-full'}`}>
        <div className={`flex items-center ${settings.style === 'horizontal' && !isMobile ? 'justify-between' : 'flex-col space-y-4'}`}>
          {settings.showLogo && (
            <div className="font-bold text-lg">
              {settings.logoText}
            </div>
          )}
          
          <nav className={isMobile ? 'w-full' : ''}>
            <ul className={`flex ${settings.style === 'horizontal' && !isMobile ? 'space-x-6' : 'flex-col space-y-2'}`}>
              {settings.items.map((item) => (
                <li key={item.id} className="relative group">
                  <a 
                    href={item.path}
                    className="hover:text-blue-600 transition-colors flex items-center gap-1"
                    onClick={(e) => e.preventDefault()}
                  >
                    {item.label}
                    {item.isExternal && <ExternalLink className="h-3 w-3" />}
                  </a>
                  {item.children && item.children.length > 0 && (
                    <ul className={`${isMobile ? 'ml-4 mt-2' : 'absolute top-full left-0 hidden group-hover:block bg-white border rounded shadow-lg py-2 min-w-48'}`}>
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <a 
                            href={child.path}
                            className="block px-4 py-2 hover:bg-gray-100 transition-colors"
                            onClick={(e) => e.preventDefault()}
                          >
                            {child.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Navigation Preview</h3>
        <div className="flex gap-2">
          <Button
            variant={previewMode === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSetPreviewMode('desktop')}
          >
            <Monitor className="h-4 w-4 mr-1" />
            Desktop
          </Button>
          <Button
            variant={previewMode === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSetPreviewMode('mobile')}
          >
            <Smartphone className="h-4 w-4 mr-1" />
            Mobile
          </Button>
        </div>
      </div>
      
      <div className="border-2 border-dashed border-gray-200 p-4 rounded-lg">
        {renderNavigationPreview()}
      </div>
    </div>
  );
};

export default NavigationPreviewTab;
