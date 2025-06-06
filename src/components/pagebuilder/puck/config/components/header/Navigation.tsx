import React, { useEffect, useState } from 'react';

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  openInNewTab?: boolean;
  icon?: string; // Optional icon for the navigation item
}

export interface NavigationProps {
  items?: NavigationItem[];
  layout?: 'horizontal' | 'vertical';
  spacing?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  hoverColor?: string;
  activeColor?: string;
  showIcons?: boolean; // New option to show/hide icons
  puck?: any;
}

export const Navigation: React.FC<NavigationProps> = ({
  items = [
    { id: '1', label: 'Home', url: '/', icon: '🏠' },
    { id: '2', label: 'About', url: '/about', icon: 'ℹ️' },
    { id: '3', label: 'Contact', url: '/contact', icon: '📞' }
  ],
  layout = 'horizontal',
  spacing = '2rem',
  fontSize = '16px',
  fontWeight = '500',
  color = '#374151',
  hoverColor = '#1f2937',
  activeColor = '#3b82f6',
  showIcons = false, // Default to false so icons are opt-in
  puck
}) => {
  const [isMobileContext, setIsMobileContext] = useState(false);

  useEffect(() => {
    // Simplified mobile context detection
    const checkMobileContext = () => {
      try {
        if (puck?.dragRef?.current) {
          const mobileNav = puck.dragRef.current.closest('.mobile-navigation');
          setIsMobileContext(!!mobileNav);
        }
      } catch (error) {
        console.warn('Navigation: Error checking mobile context:', error);
        setIsMobileContext(false);
      }
    };

    // Initial check
    checkMobileContext();
    
    // Re-check after a short delay to ensure DOM is ready
    const timer = setTimeout(checkMobileContext, 100);
    return () => clearTimeout(timer);
  }, [puck]);

  // Force vertical layout in mobile context, otherwise use specified layout
  const effectiveLayout = isMobileContext ? 'vertical' : layout;
  const effectiveSpacing = isMobileContext ? '0' : spacing;

  return (
    <nav
      style={{
        display: 'flex',
        flexDirection: effectiveLayout === 'horizontal' ? 'row' : 'column',
        gap: effectiveSpacing,
        alignItems: effectiveLayout === 'horizontal' ? 'center' : 'stretch',
        width: '100%'
      }}
      ref={puck?.dragRef}
    >
      {items.map((item, index) => (
        <a
          key={item.id || `nav-item-${index}`}
          href={item.url}
          target={item.openInNewTab ? '_blank' : '_self'}
          rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
          style={{
            fontSize,
            fontWeight,
            color,
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            padding: effectiveLayout === 'vertical' ? '0.875rem 1rem' : '0.5rem 0.75rem',
            position: 'relative',
            width: effectiveLayout === 'vertical' ? '100%' : 'auto',
            borderRadius: effectiveLayout === 'vertical' ? '8px' : '0',
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: showIcons && item.icon ? '0.5rem' : '0',
            borderBottom: effectiveLayout === 'vertical' && isMobileContext ? '1px solid #f3f4f6' : 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = hoverColor;
            if (effectiveLayout === 'vertical') {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.transform = 'translateX(4px)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = color;
            if (effectiveLayout === 'vertical') {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'translateX(0px)';
            }
          }}
        >
          {showIcons && item.icon && (
            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
          )}
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  );
};

// Navigation Component Configuration
export const navigationConfig = {
  fields: {
    items: {
      type: 'array' as const,
      label: 'Navigation Items',
      arrayFields: {
        id: {
          type: 'text' as const,
          label: 'ID',
        },
        label: {
          type: 'text' as const,
          label: 'Label',
        },
        url: {
          type: 'text' as const,
          label: 'URL',
        },
        icon: {
          type: 'text' as const,
          label: 'Icon (emoji or text)',
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
    },
    layout: {
      type: 'radio' as const,
      label: 'Layout',
      options: [
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Vertical', value: 'vertical' },
      ],
    },
    showIcons: {
      type: 'radio' as const,
      label: 'Show Icons',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    spacing: {
      type: 'text' as const,
      label: 'Spacing',
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
        { label: '500', value: '500' },
        { label: '600', value: '600' },
        { label: 'Bold', value: 'bold' },
      ],
    },
    color: {
      type: 'text' as const,
      label: 'Text Color',
    },
    hoverColor: {
      type: 'text' as const,
      label: 'Hover Color',
    },
  },
  defaultProps: {
    items: [
      { id: '1', label: 'Home', url: '/', icon: '🏠', openInNewTab: false },
      { id: '2', label: 'About', url: '/about', icon: 'ℹ️', openInNewTab: false },
      { id: '3', label: 'Contact', url: '/contact', icon: '📞', openInNewTab: false },
    ],
    layout: 'horizontal',
    showIcons: false,
    spacing: '2rem',
    fontSize: '16px',
    fontWeight: '500',
    color: '#374151',
    hoverColor: '#1f2937',
  },
  render: Navigation,
};

export default Navigation; 