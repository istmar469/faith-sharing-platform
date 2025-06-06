import React from 'react';

export interface LogoProps {
  type?: 'text' | 'image';
  text?: string;
  imageUrl?: string;
  imageAlt?: string;
  width?: string;
  height?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  linkUrl?: string;
  puck?: any;
}

export const Logo: React.FC<LogoProps> = ({
  type = 'text',
  text = 'Your Church',
  imageUrl = '',
  imageAlt = 'Logo',
  width = 'auto',
  height = '40px',
  fontSize = '24px',
  fontWeight = 'bold',
  color = '#1f2937',
  linkUrl = '/',
  puck
}) => {
  const content = type === 'image' && imageUrl ? (
    <img
      src={imageUrl}
      alt={imageAlt}
      style={{
        width,
        height,
        objectFit: 'contain'
      }}
    />
  ) : (
    <span
      style={{
        fontSize,
        fontWeight,
        color,
        textDecoration: 'none'
      }}
    >
      {text}
    </span>
  );

  if (linkUrl) {
    return (
      <a
        href={linkUrl}
        style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center'
        }}
        ref={puck?.dragRef}
      >
        {content}
      </a>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center'
      }}
      ref={puck?.dragRef}
    >
      {content}
    </div>
  );
};

// Logo Component Configuration
export const logoConfig = {
  fields: {
    type: {
      type: 'radio' as const,
      label: 'Logo Type',
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Image', value: 'image' },
      ],
    },
    text: {
      type: 'text' as const,
      label: 'Logo Text',
    },
    imageUrl: {
      type: 'text' as const,
      label: 'Image URL',
    },
    imageAlt: {
      type: 'text' as const,
      label: 'Image Alt Text',
    },
    width: {
      type: 'text' as const,
      label: 'Width',
    },
    height: {
      type: 'text' as const,
      label: 'Height',
    },
    fontSize: {
      type: 'text' as const,
      label: 'Font Size',
    },
    fontWeight: {
      type: 'select' as const,
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
      type: 'text' as const,
      label: 'Text Color',
    },
    linkUrl: {
      type: 'text' as const,
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

export default Logo; 