import React from 'react';

export interface ButtonProps {
  text?: string;
  url?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  hoverBackgroundColor?: string;
  hoverTextColor?: string;
  fontWeight?: string;
  openInNewTab?: boolean;
  fullWidth?: boolean;
  puck?: any;
}

export const Button: React.FC<ButtonProps> = ({
  text = 'Get Started',
  url = '#',
  variant = 'primary',
  size = 'md',
  borderRadius = 'md',
  backgroundColor = '#3b82f6',
  textColor = '#ffffff',
  borderColor = '#3b82f6',
  hoverBackgroundColor = '#2563eb',
  hoverTextColor = '#ffffff',
  fontWeight = '600',
  openInNewTab = false,
  fullWidth = false,
  puck
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '0.5rem 1rem',
          fontSize: '14px',
          minHeight: '36px'
        };
      case 'lg':
        return {
          padding: '0.875rem 2rem',
          fontSize: '18px',
          minHeight: '48px'
        };
      default: // md
        return {
          padding: '0.75rem 1.5rem',
          fontSize: '16px',
          minHeight: '42px'
        };
    }
  };

  const getBorderRadiusValue = () => {
    switch (borderRadius) {
      case 'none':
        return '0';
      case 'sm':
        return '4px';
      case 'lg':
        return '12px';
      case 'full':
        return '9999px';
      default: // md
        return '8px';
    }
  };

  const getVariantStyles = () => {
    const sizeStyles = getSizeStyles();
    const radiusValue = getBorderRadiusValue();

    const baseStyles = {
      ...sizeStyles,
      borderRadius: radiusValue,
      fontWeight,
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      width: fullWidth ? '100%' : 'auto',
      border: 'none',
      outline: 'none'
    };

    switch (variant) {
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: '#f3f4f6',
          color: '#374151',
          border: '1px solid #d1d5db'
        };
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: borderColor,
          border: `2px solid ${borderColor}`
        };
      case 'ghost':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: textColor,
          border: 'none'
        };
      default: // primary
        return {
          ...baseStyles,
          backgroundColor,
          color: textColor,
          border: `1px solid ${borderColor}`
        };
    }
  };

  const getHoverStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: '#e5e7eb',
          color: '#1f2937',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        };
      case 'outline':
        return {
          backgroundColor: borderColor,
          color: hoverTextColor,
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        };
      case 'ghost':
        return {
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          transform: 'translateY(-1px)'
        };
      default: // primary
        return {
          backgroundColor: hoverBackgroundColor,
          color: hoverTextColor,
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
        };
    }
  };

  const baseStyles = getVariantStyles();
  const hoverStyles = getHoverStyles();

  const handleClick = (e: React.MouseEvent) => {
    // Prevent default if it's a hash link to avoid page jump
    if (url === '#') {
      e.preventDefault();
    }
  };

  return (
    <a
      href={url}
      target={openInNewTab ? '_blank' : '_self'}
      rel={openInNewTab ? 'noopener noreferrer' : undefined}
      style={baseStyles}
      ref={puck?.dragRef}
      onClick={handleClick}
      onMouseEnter={(e) => {
        try {
          Object.assign(e.currentTarget.style, hoverStyles);
        } catch (error) {
          console.warn('Button: Error applying hover styles:', error);
        }
      }}
      onMouseLeave={(e) => {
        try {
          Object.assign(e.currentTarget.style, baseStyles);
        } catch (error) {
          console.warn('Button: Error removing hover styles:', error);
        }
      }}
    >
      {text}
    </a>
  );
};

// Button Component Configuration
export const buttonConfig = {
  fields: {
    text: {
      type: 'text' as const,
      label: 'Button Text',
    },
    url: {
      type: 'text' as const,
      label: 'Link URL',
    },
    variant: {
      type: 'radio' as const,
      label: 'Button Style',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Outline', value: 'outline' },
        { label: 'Ghost', value: 'ghost' },
      ],
    },
    size: {
      type: 'radio' as const,
      label: 'Size',
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ],
    },
    borderRadius: {
      type: 'radio' as const,
      label: 'Border Radius',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
        { label: 'Full (Pill)', value: 'full' },
      ],
    },
    backgroundColor: {
      type: 'text' as const,
      label: 'Background Color',
    },
    textColor: {
      type: 'text' as const,
      label: 'Text Color',
    },
    borderColor: {
      type: 'text' as const,
      label: 'Border Color',
    },
    hoverBackgroundColor: {
      type: 'text' as const,
      label: 'Hover Background Color',
    },
    hoverTextColor: {
      type: 'text' as const,
      label: 'Hover Text Color',
    },
    fontWeight: {
      type: 'select' as const,
      label: 'Font Weight',
      options: [
        { label: 'Normal', value: '400' },
        { label: 'Medium', value: '500' },
        { label: 'Semi Bold', value: '600' },
        { label: 'Bold', value: '700' },
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
    fullWidth: {
      type: 'radio' as const,
      label: 'Full Width',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
  },
  defaultProps: {
    text: 'Get Started',
    url: '#',
    variant: 'primary',
    size: 'md',
    borderRadius: 'md',
    backgroundColor: '#3b82f6',
    textColor: '#ffffff',
    borderColor: '#3b82f6',
    hoverBackgroundColor: '#2563eb',
    hoverTextColor: '#ffffff',
    fontWeight: '600',
    openInNewTab: false,
    fullWidth: false,
  },
  render: Button,
};

export default Button; 