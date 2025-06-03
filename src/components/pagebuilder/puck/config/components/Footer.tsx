import React from 'react';
import { ComponentConfig } from '@measured/puck';

export interface FooterProps {
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  showSocialLinks?: boolean;
  showNewsletter?: boolean;
  companyName?: string;
  socialLinks?: Array<{
    platform: string;
    url: string;
  }>;
  layout?: 'simple' | 'enhanced';
}

const Footer: React.FC<FooterProps> = (rawProps) => {
  // Safe prop extraction with defaults
  const text = typeof rawProps.text === 'string' ? rawProps.text : '© 2024 My Website. All rights reserved.';
  const backgroundColor = typeof rawProps.backgroundColor === 'string' ? rawProps.backgroundColor : 'gray-900';
  const textColor = typeof rawProps.textColor === 'string' ? rawProps.textColor : 'white';
  const showSocialLinks = Boolean(rawProps.showSocialLinks);
  const showNewsletter = Boolean(rawProps.showNewsletter);
  const companyName = typeof rawProps.companyName === 'string' ? rawProps.companyName : 'My Company';
  const layout = ['simple', 'enhanced'].includes(rawProps.layout as string) ? rawProps.layout : 'simple';
  
  // Safe socialLinks handling
  const safeSocialLinks = (() => {
    if (!rawProps.socialLinks) {
      return [];
    }
    
    // If socialLinks is already an array, use it
    if (Array.isArray(rawProps.socialLinks)) {
      return rawProps.socialLinks;
    }
    
    // If socialLinks is a string, try to parse it
    if (typeof rawProps.socialLinks === 'string') {
      try {
        const parsed = JSON.parse(rawProps.socialLinks);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (error) {
        console.warn('Footer: Failed to parse socialLinks string:', error);
      }
    }
    
    // Fallback to empty array
    return [];
  })();

  // Simple layout (original functionality)
  if (layout === 'simple') {
    return (
      <footer className={`bg-${backgroundColor} text-${textColor} py-8`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm">{text}</p>
            {showSocialLinks && safeSocialLinks.length > 0 && (
              <div className="mt-4 flex justify-center space-x-4">
                {safeSocialLinks.map((link, index) => {
                  const platform = typeof link?.platform === 'string' ? link.platform : `Link ${index + 1}`;
                  const url = typeof link?.url === 'string' ? link.url : '#';
                  
                  return (
                    <a
                      key={index}
                      href={url}
                      className="text-gray-400 hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {platform}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </footer>
    );
  }

  // Enhanced layout with grid and multiple sections
  return (
    <footer className={`bg-${backgroundColor} text-${textColor} py-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{companyName}</h3>
            <p className="text-gray-400 text-sm">
              Building amazing experiences for our customers worldwide.
            </p>
          </div>

          {/* Newsletter */}
          {showNewsletter && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <p className="text-gray-400 text-sm mb-4">
                Stay updated with our latest news and offers.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-l-md focus:outline-none focus:border-blue-500"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          )}

          {/* Social Links */}
          {showSocialLinks && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                {safeSocialLinks.length > 0 ? (
                  safeSocialLinks.map((link, index) => {
                    const platform = typeof link?.platform === 'string' ? link.platform : `Link ${index + 1}`;
                    const url = typeof link?.url === 'string' ? link.url : '#';
                    
                    return (
                      <a
                        key={index}
                        href={url}
                        className="text-gray-400 hover:text-white transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {platform}
                      </a>
                    );
                  })
                ) : (
                  <>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      Facebook
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      Twitter
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      Instagram
                    </a>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">{text}</p>
        </div>
      </div>
    </footer>
  );
};

export const footerConfig: ComponentConfig<FooterProps> = {
  fields: {
    layout: {
      type: 'select',
      label: 'Layout Style',
      options: [
        { label: 'Simple', value: 'simple' },
        { label: 'Enhanced', value: 'enhanced' }
      ]
    },
    text: {
      type: 'text',
      label: 'Copyright Text'
    },
    backgroundColor: {
      type: 'text',
      label: 'Background Color'
    },
    textColor: {
      type: 'text',
      label: 'Text Color'
    },
    showSocialLinks: {
      type: 'radio',
      label: 'Show Social Links',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    showNewsletter: {
      type: 'radio',
      label: 'Show Newsletter',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    companyName: {
      type: 'text',
      label: 'Company Name'
    }
  },
  render: (props) => <Footer {...props} />
};

export default Footer;
