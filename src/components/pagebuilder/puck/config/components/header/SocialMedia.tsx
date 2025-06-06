import React from 'react';

export interface SocialMediaLink {
  id: string;
  platform: string;
  url: string;
  icon?: string;
  label?: string;
}

export interface SocialMediaProps {
  links?: SocialMediaLink[];
  layout?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  spacing?: string;
  color?: string;
  hoverColor?: string;
  showLabels?: boolean;
  openInNewTab?: boolean;
  puck?: any;
}

const defaultSocialLinks: SocialMediaLink[] = [
  { id: '1', platform: 'Facebook', url: 'https://facebook.com', icon: '📘', label: 'Facebook' },
  { id: '2', platform: 'Twitter', url: 'https://twitter.com', icon: '🐦', label: 'Twitter' },
  { id: '3', platform: 'Instagram', url: 'https://instagram.com', icon: '📷', label: 'Instagram' },
  { id: '4', platform: 'YouTube', url: 'https://youtube.com', icon: '📺', label: 'YouTube' },
];

// Get appropriate icon for social platform
const getSocialIcon = (platform: string, customIcon?: string) => {
  if (customIcon) return customIcon;
  
  const platformIcons: { [key: string]: string } = {
    'facebook': '📘',
    'twitter': '🐦',
    'instagram': '📷',
    'youtube': '📺',
    'linkedin': '💼',
    'tiktok': '🎵',
    'pinterest': '📌',
    'snapchat': '👻',
    'discord': '💬',
    'twitch': '🎮',
    'email': '📧',
    'phone': '📞',
    'website': '🌐',
  };
  
  return platformIcons[platform.toLowerCase()] || '🔗';
};

// Get size styles
const getSizeStyles = (size: string) => {
  switch (size) {
    case 'sm':
      return {
        fontSize: '14px',
        padding: '0.25rem',
        iconSize: '16px'
      };
    case 'lg':
      return {
        fontSize: '20px',
        padding: '0.75rem',
        iconSize: '24px'
      };
    default: // md
      return {
        fontSize: '16px',
        padding: '0.5rem',
        iconSize: '20px'
      };
  }
};

export const SocialMedia: React.FC<SocialMediaProps> = ({
  links = defaultSocialLinks,
  layout = 'horizontal',
  size = 'md',
  spacing = '0.5rem',
  color = '#6b7280',
  hoverColor = '#374151',
  showLabels = false,
  openInNewTab = true,
  puck
}) => {
  const sizeStyles = getSizeStyles(size);
  
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: layout === 'horizontal' ? 'row' : 'column',
        gap: spacing,
        alignItems: 'center'
      }}
      ref={puck?.dragRef}
    >
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target={openInNewTab ? '_blank' : '_self'}
          rel={openInNewTab ? 'noopener noreferrer' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            color,
            textDecoration: 'none',
            fontSize: sizeStyles.fontSize,
            padding: sizeStyles.padding,
            borderRadius: '6px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = hoverColor;
            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = color;
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title={link.label || link.platform}
        >
          <span style={{ fontSize: sizeStyles.iconSize }}>
            {getSocialIcon(link.platform, link.icon)}
          </span>
          {showLabels && (
            <span style={{ fontSize: sizeStyles.fontSize }}>
              {link.label || link.platform}
            </span>
          )}
        </a>
      ))}
    </div>
  );
};

// Social Media Component Configuration
export const socialMediaConfig = {
  fields: {
    links: {
      type: 'array' as const,
      label: 'Social Media Links',
      arrayFields: {
        id: {
          type: 'text' as const,
          label: 'ID',
        },
        platform: {
          type: 'text' as const,
          label: 'Platform Name',
        },
        url: {
          type: 'text' as const,
          label: 'URL',
        },
        icon: {
          type: 'text' as const,
          label: 'Custom Icon (emoji or text)',
        },
        label: {
          type: 'text' as const,
          label: 'Display Label',
        },
      },
    },
    layout: {
      type: 'radio' as const,
      label: 'Layout',
      options: [
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Vertical', value: 'vertical' },
      ],
    },
    size: {
      type: 'select' as const,
      label: 'Size',
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ],
    },
    spacing: {
      type: 'text' as const,
      label: 'Spacing',
    },
    color: {
      type: 'text' as const,
      label: 'Icon Color',
    },
    hoverColor: {
      type: 'text' as const,
      label: 'Hover Color',
    },
    showLabels: {
      type: 'radio' as const,
      label: 'Show Labels',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    openInNewTab: {
      type: 'radio' as const,
      label: 'Open in New Tab',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
  },
  defaultProps: {
    links: defaultSocialLinks,
    layout: 'horizontal',
    size: 'md',
    spacing: '0.5rem',
    color: '#6b7280',
    hoverColor: '#374151',
    showLabels: false,
    openInNewTab: true,
  },
  render: SocialMedia,
};

export default SocialMedia; 