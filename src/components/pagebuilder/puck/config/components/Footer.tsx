
import React from 'react';
import { ComponentConfig } from '@measured/puck';

export interface FooterProps {
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  showSocialLinks?: boolean;
  socialLinks?: Array<{
    platform: string;
    url: string;
  }>;
}

const Footer: React.FC<FooterProps> = ({
  text = '© 2024 My Website. All rights reserved.',
  backgroundColor = 'gray-900',
  textColor = 'white',
  showSocialLinks = false,
  socialLinks = []
}) => {
  return (
    <footer className={`bg-${backgroundColor} text-${textColor} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm">{text}</p>
          {showSocialLinks && socialLinks.length > 0 && (
            <div className="mt-4 flex justify-center space-x-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  className="text-gray-400 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.platform}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export const footerConfig: ComponentConfig<FooterProps> = {
  fields: {
    text: {
      type: 'text',
      label: 'Footer Text'
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
    }
  },
  render: ({ text, backgroundColor, textColor, showSocialLinks, socialLinks }) => (
    <Footer 
      text={text}
      backgroundColor={backgroundColor}
      textColor={textColor}
      showSocialLinks={showSocialLinks}
      socialLinks={socialLinks}
    />
  )
};

export default Footer;
