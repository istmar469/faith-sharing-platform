
import React from 'react';
import { ComponentConfig } from '@measured/puck';

export interface EnhancedFooterProps {
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  showSocialLinks?: boolean;
  showNewsletter?: boolean;
  companyName?: string;
}

const EnhancedFooter: React.FC<EnhancedFooterProps> = ({
  text = '© 2024 My Company. All rights reserved.',
  backgroundColor = 'gray-900',
  textColor = 'white',
  showSocialLinks = true,
  showNewsletter = false,
  companyName = 'My Company'
}) => {
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
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Facebook
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Twitter
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Instagram
                </a>
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

export const enhancedFooterConfig: ComponentConfig<EnhancedFooterProps> = {
  fields: {
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
  render: (props) => <EnhancedFooter {...props} />
};

export default EnhancedFooter;
