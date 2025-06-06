import React from 'react';
import { ComponentConfig, DropZone } from '@measured/puck';
import { HeaderProps } from './types';
import Header from '../Header';
import { FlexibleHeader } from './FlexibleHeader';
import { Logo } from './Logo';
import { Navigation } from './Navigation';
import { Button } from './Button';

export const headerConfig: ComponentConfig<HeaderProps> = {
  label: 'Header',
  render: Header,
  fields: {
    logo: {
      type: 'text',
      label: 'Logo URL'
    },
    logoText: {
      type: 'text',
      label: 'Logo Text'
    },
    logoSize: {
      type: 'number',
      label: 'Logo Size (px)',
      min: 16,
      max: 100
    },
    logoPosition: {
      type: 'select',
      label: 'Logo Position',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' }
      ]
    },
    backgroundType: {
      type: 'select',
      label: 'Background Type',
      options: [
        { label: 'Solid Color', value: 'solid' },
        { label: 'Gradient', value: 'gradient' }
      ]
    },
    backgroundColor: {
      type: 'text',
      label: 'Background Color'
    },
    gradientFrom: {
      type: 'text',
      label: 'Gradient Start Color'
    },
    gradientTo: {
      type: 'text',
      label: 'Gradient End Color'
    },
    gradientDirection: {
      type: 'select',
      label: 'Gradient Direction',
      options: [
        { label: 'Left to Right', value: 'to-r' },
        { label: 'Right to Left', value: 'to-l' },
        { label: 'Top to Bottom', value: 'to-b' },
        { label: 'Bottom to Top', value: 'to-t' },
        { label: 'Top-left to Bottom-right', value: 'to-br' },
        { label: 'Top-right to Bottom-left', value: 'to-bl' }
      ]
    },
    textColor: {
      type: 'text',
      label: 'Text Color'
    },
    linkColor: {
      type: 'text',
      label: 'Link Color'
    },
    linkHoverColor: {
      type: 'text',
      label: 'Link Hover Color'
    },
    height: {
      type: 'number',
      label: 'Header Height (px)',
      min: 40,
      max: 200
    },
    paddingX: {
      type: 'number',
      label: 'Horizontal Padding (px)',
      min: 0,
      max: 100
    },
    paddingY: {
      type: 'number',
      label: 'Vertical Padding (px)',
      min: 0,
      max: 50
    },
    borderWidth: {
      type: 'number',
      label: 'Border Width (px)',
      min: 0,
      max: 10
    },
    borderColor: {
      type: 'text',
      label: 'Border Color'
    },
    borderRadius: {
      type: 'number',
      label: 'Border Radius (px)',
      min: 0,
      max: 50
    },
    shadow: {
      type: 'select',
      label: 'Shadow',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
        { label: 'Extra Large', value: 'xl' }
      ]
    },
    maxWidth: {
      type: 'select',
      label: 'Max Width',
      options: [
        { label: 'Full Width', value: 'full' },
        { label: 'Container', value: 'container' },
        { label: 'Large', value: 'lg' },
        { label: 'Extra Large', value: 'xl' },
        { label: '2X Large', value: '2xl' }
      ]
    },
    isSticky: {
      type: 'radio',
      label: 'Sticky Header',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    showNavigation: {
      type: 'radio',
      label: 'Show Navigation',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    showSearch: {
      type: 'radio',
      label: 'Show Search',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    showUserMenu: {
      type: 'radio',
      label: 'Show User Menu',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    enablePageManagement: {
      type: 'radio',
      label: 'Enable Page Management',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    layout: {
      type: 'select',
      label: 'Layout',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Centered', value: 'centered' },
        { label: 'Minimal', value: 'minimal' },
        { label: 'Split', value: 'split' }
      ]
    },
    navigationStyle: {
      type: 'select',
      label: 'Navigation Style',
      options: [
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Dropdown', value: 'dropdown' }
      ]
    },
    animationStyle: {
      type: 'select',
      label: 'Animation Style',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Fade', value: 'fade' },
        { label: 'Slide', value: 'slide' },
        { label: 'Scale', value: 'scale' }
      ]
    },
    fontFamily: {
      type: 'text',
      label: 'Font Family'
    },
    fontSize: {
      type: 'number',
      label: 'Font Size (px)',
      min: 10,
      max: 24
    },
    fontWeight: {
      type: 'select',
      label: 'Font Weight',
      options: [
        { label: 'Normal', value: 'normal' },
        { label: 'Medium', value: 'medium' },
        { label: 'Semi Bold', value: 'semibold' },
        { label: 'Bold', value: 'bold' }
      ]
    },
    customNavigationItems: {
      type: 'array',
      label: 'Custom Navigation Items',
      getItemSummary: (item: any) => item.label || 'Navigation Item',
      defaultItemProps: {
        label: 'New Item',
        href: '#',
        isExternal: false
      },
      arrayFields: {
        label: { type: 'text', label: 'Label' },
        href: { type: 'text', label: 'URL' },
        isExternal: { 
          type: 'radio', 
          label: 'Open in new tab', 
          options: [
            { label: 'Yes', value: true }, 
            { label: 'No', value: false }
          ] 
        }
      }
    },
    organizationBranding: {
      type: 'object',
      label: 'Organization Branding',
      objectFields: {
        primaryColor: { type: 'text', label: 'Primary Color' },
        secondaryColor: { type: 'text', label: 'Secondary Color' },
        fontFamily: { type: 'text', label: 'Font Family' }
      }
    }
  },
  defaultProps: {
    logoText: 'My Church',
    logoSize: 32,
    logoPosition: 'left',
    backgroundColor: '#ffffff',
    backgroundType: 'solid',
    gradientFrom: '#3b82f6',
    gradientTo: '#1d4ed8',
    gradientDirection: 'to-r',
    textColor: '#1f2937',
    linkColor: '#4b5563',
    linkHoverColor: '#3b82f6',
    height: 64,
    paddingX: 16,
    paddingY: 12,
    borderWidth: 0,
    borderColor: '#e5e7eb',
    borderRadius: 0,
    shadow: 'sm',
    maxWidth: 'container',
    isSticky: false,
    showNavigation: true,
    showSearch: false,
    showUserMenu: false,
    enablePageManagement: true,
    layout: 'default',
    navigationStyle: 'horizontal',
    animationStyle: 'fade',
    fontFamily: 'system-ui',
    fontSize: 14,
    fontWeight: 'medium',
    customNavigationItems: [],
    organizationBranding: {}
  }
};

// Flexible Header with DropZones Configuration
export const flexibleHeaderConfig: ComponentConfig<any> = {
  fields: {
    backgroundColor: {
      type: 'text',
      label: 'Background Color',
    },
    height: {
      type: 'text',
      label: 'Height',
    },
    borderBottom: {
      type: 'radio',
      label: 'Show Border Bottom',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    sticky: {
      type: 'radio',
      label: 'Sticky Header',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    maxWidth: {
      type: 'text',
      label: 'Max Width',
    },
  },
  defaultProps: {
    backgroundColor: '#ffffff',
    height: '70px',
    borderBottom: true,
    sticky: true,
    maxWidth: '1200px',
  },
  render: ({ backgroundColor, height, borderBottom, sticky, maxWidth, puck }) => {
    return (
      <header
        className={`flexible-header ${sticky ? 'sticky top-0 z-50' : ''}`}
        style={{
          backgroundColor,
          borderBottom: borderBottom ? '1px solid #e5e7eb' : 'none',
          boxShadow: sticky ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          width: '100%'
        }}
        ref={puck?.dragRef}
      >
        <div
          style={{
            maxWidth,
            margin: '0 auto',
            padding: '0 1rem',
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          {/* Logo Section - Left */}
          <div 
            className="header-logo-zone" 
            style={{ 
              flex: '0 0 auto',
              minWidth: '200px'
            }}
          >
            <DropZone zone="logo" allow={['Logo']} />
          </div>

          {/* Navigation Section - Center */}
          <div 
            className="header-navigation-zone" 
            style={{ 
              flex: '1 1 auto', 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <DropZone zone="navigation" allow={['Navigation']} />
          </div>

          {/* Actions Section - Right */}
          <div 
            className="header-actions-zone" 
            style={{ 
              flex: '0 0 auto',
              minWidth: '150px',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <DropZone zone="actions" allow={['Button']} />
          </div>
        </div>
      </header>
    );
  },
};

// Logo Component Configuration
export const logoConfig: ComponentConfig<any> = {
  fields: {
    type: {
      type: 'radio',
      label: 'Logo Type',
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Image', value: 'image' },
      ],
    },
    text: {
      type: 'text',
      label: 'Logo Text',
    },
    imageUrl: {
      type: 'text',
      label: 'Image URL',
    },
    imageAlt: {
      type: 'text',
      label: 'Image Alt Text',
    },
    width: {
      type: 'text',
      label: 'Width',
    },
    height: {
      type: 'text',
      label: 'Height',
    },
    fontSize: {
      type: 'text',
      label: 'Font Size',
    },
    fontWeight: {
      type: 'select',
      label: 'Font Weight',
      options: [
        { label: 'Normal', value: 'normal' },
        { label: 'Bold', value: 'bold' },
        { label: '500', value: '500' },
        { label: '600', value: '600' },
        { label: '700', value: '700' },
      ],
    },
    color: {
      type: 'text',
      label: 'Text Color',
    },
    linkUrl: {
      type: 'text',
      label: 'Link URL',
    },
  },
  defaultProps: {
    type: 'text',
    text: 'Your Church',
    imageUrl: '',
    imageAlt: 'Logo',
    width: 'auto',
    height: '40px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    linkUrl: '/',
  },
  render: Logo,
};

// Navigation Component Configuration
export const navigationConfig: ComponentConfig<any> = {
  fields: {
    items: {
      type: 'array',
      label: 'Navigation Items',
      arrayFields: {
        id: {
          type: 'text',
          label: 'ID',
        },
        label: {
          type: 'text',
          label: 'Label',
        },
        url: {
          type: 'text',
          label: 'URL',
        },
        openInNewTab: {
          type: 'radio',
          label: 'Open in New Tab',
          options: [
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ],
        },
      },
    },
    layout: {
      type: 'radio',
      label: 'Layout',
      options: [
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Vertical', value: 'vertical' },
      ],
    },
    spacing: {
      type: 'text',
      label: 'Spacing',
    },
    fontSize: {
      type: 'text',
      label: 'Font Size',
    },
    fontWeight: {
      type: 'select',
      label: 'Font Weight',
      options: [
        { label: 'Normal', value: 'normal' },
        { label: '500', value: '500' },
        { label: '600', value: '600' },
        { label: 'Bold', value: 'bold' },
      ],
    },
    color: {
      type: 'text',
      label: 'Text Color',
    },
    hoverColor: {
      type: 'text',
      label: 'Hover Color',
    },
  },
  defaultProps: {
    items: [
      { id: '1', label: 'Home', url: '/', openInNewTab: false },
      { id: '2', label: 'About', url: '/about', openInNewTab: false },
      { id: '3', label: 'Contact', url: '/contact', openInNewTab: false },
    ],
    layout: 'horizontal',
    spacing: '2rem',
    fontSize: '16px',
    fontWeight: '500',
    color: '#374151',
    hoverColor: '#1f2937',
  },
  render: Navigation,
};

// Button Component Configuration
export const buttonConfig: ComponentConfig<any> = {
  fields: {
    text: {
      type: 'text',
      label: 'Button Text',
    },
    url: {
      type: 'text',
      label: 'URL',
    },
    variant: {
      type: 'select',
      label: 'Variant',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Outline', value: 'outline' },
        { label: 'Ghost', value: 'ghost' },
      ],
    },
    size: {
      type: 'select',
      label: 'Size',
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ],
    },
    openInNewTab: {
      type: 'radio',
      label: 'Open in New Tab',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    backgroundColor: {
      type: 'text',
      label: 'Background Color (optional)',
    },
    textColor: {
      type: 'text',
      label: 'Text Color (optional)',
    },
    borderColor: {
      type: 'text',
      label: 'Border Color (optional)',
    },
  },
  defaultProps: {
    text: 'Get Started',
    url: '#',
    variant: 'primary',
    size: 'md',
    openInNewTab: false,
    backgroundColor: '',
    textColor: '',
    borderColor: '',
  },
  render: Button,
};
