import React, { useState, useEffect } from 'react';
import { DropZone } from '@measured/puck';
import { Menu, X } from 'lucide-react';
import { useTenantContext } from '@/components/context/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import UserSessionIndicator from '@/components/auth/UserSessionIndicator';

export type MobileMenuStyle = 'fullscreen' | 'slide-right' | 'slide-left';

export interface NavigationItem {
  id: string;
  pageId?: string;
  label: string;
  url: string;
  icon?: string;
  order: number;
  type: 'page' | 'external';
  openInNewTab?: boolean;
}

export interface SimpleHeaderProps {
  backgroundColor?: string;
  height?: string;
  borderBottom?: boolean;
  sticky?: boolean;
  maxWidth?: string;
  padding?: string;
  // Logo props
  logoText?: string;
  logoUrl?: string;
  logoSize?: string;
  // Navigation props
  showNavigation?: boolean;
  showHomepage?: boolean;
  showIcons?: boolean;
  maxItems?: number;
  externalLinks?: NavigationItem[];
  // Mobile navigation props
  mobileMenuStyle?: MobileMenuStyle;
  mobileBreakpoint?: number;
  hamburgerColor?: string;
  hamburgerSize?: string;
  mobileMenuBg?: string;
  mobileMenuTextColor?: string;
  mobileMenuOverlayBg?: string;
  animationDuration?: string;
  showCloseButton?: boolean;
  closeButtonPosition?: 'top-left' | 'top-right';
  // Styling props
  navFontSize?: string;
  navFontWeight?: string;
  navColor?: string;
  navHoverColor?: string;
}

export const SimpleHeader: React.FC<SimpleHeaderProps> = ({
  backgroundColor = '#ffffff',
  height = '70px',
  borderBottom = true,
  sticky = true,
  maxWidth = '1200px',
  padding = '0 1rem',
  // Logo defaults
  logoText = 'Your Church',
  logoUrl = '',
  logoSize = '32px',
  // Navigation defaults
  showNavigation = true,
  showHomepage = true,
  showIcons = false,
  maxItems = 6,
  externalLinks = [],
  // Mobile navigation defaults
  mobileMenuStyle = 'slide-right',
  mobileBreakpoint = 768,
  hamburgerColor = '#374151',
  hamburgerSize = '24px',
  mobileMenuBg = '#ffffff',
  mobileMenuTextColor = '#374151',
  mobileMenuOverlayBg = 'rgba(0, 0, 0, 0.5)',
  animationDuration = '300ms',
  showCloseButton = true,
  closeButtonPosition = 'top-right',
  // Styling defaults
  navFontSize = '16px',
  navFontWeight = '500',
  navColor = '#374151',
  navHoverColor = '#1f2937'
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { organizationId } = useTenantContext();

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Fetch navigation items
  useEffect(() => {
    if (organizationId && showNavigation) {
      fetchNavigationItems();
    } else {
      setLoading(false);
    }
  }, [organizationId, showNavigation, externalLinks]);

  const fetchNavigationItems = async () => {
    try {
      setLoading(true);
      
      const { data: pages, error } = await supabase
        .from('pages')
        .select('id, title, slug, is_homepage, display_order')
        .eq('organization_id', organizationId)
        .eq('published', true)
        .eq('show_in_navigation', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching navigation items:', error);
        setNavigationItems([]);
        return;
      }

      const navItems: NavigationItem[] = [];

      // Add homepage if enabled and exists
      if (showHomepage) {
        const homepage = pages?.find(page => page.is_homepage);
        if (homepage) {
          navItems.push({
            id: `page-${homepage.id}`,
            pageId: homepage.id,
            label: 'Home',
            url: '/',
            icon: showIcons ? '🏠' : undefined,
            order: -1,
            type: 'page'
          });
        }
      }

      // Add other pages
      const otherPages = pages?.filter(page => !page.is_homepage) || [];
      otherPages.forEach((page, index) => {
        navItems.push({
          id: `page-${page.id}`,
          pageId: page.id,
          label: page.title,
          url: `/${page.slug}`,
          icon: showIcons ? getPageIcon(page.title) : undefined,
          order: page.display_order || index,
          type: 'page'
        });
      });

      // Add external links
      externalLinks.forEach((link, index) => {
        navItems.push({
          ...link,
          id: link.id || `external-${index}`,
          order: link.order || (1000 + index),
          type: 'external'
        });
      });

      // Sort by order and limit items
      const sortedItems = navItems
        .sort((a, b) => a.order - b.order)
        .slice(0, maxItems);

      setNavigationItems(sortedItems);
    } catch (error) {
      console.error('Error fetching navigation items:', error);
      setNavigationItems([]);
    } finally {
      setLoading(false);
    }
  };

  const getPageIcon = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('about')) return 'ℹ️';
    if (lowerTitle.includes('contact')) return '📞';
    if (lowerTitle.includes('service')) return '⛪';
    if (lowerTitle.includes('event')) return '📅';
    if (lowerTitle.includes('ministry')) return '🙏';
    if (lowerTitle.includes('blog') || lowerTitle.includes('news')) return '📰';
    return '📄';
  };

  const handleLinkClick = (item: NavigationItem) => {
    if (item.type === 'external' || item.openInNewTab) {
      window.open(item.url, '_blank');
    } else {
      window.location.href = item.url;
    }
    setIsMobileMenuOpen(false);
  };

  // Hamburger Button Component
  const HamburgerButton = () => (
    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: `all ${animationDuration} ease`,
        color: hamburgerColor,
        fontSize: hamburgerSize
      }}
      aria-label="Toggle mobile menu"
    >
      <div
        style={{
          width: hamburgerSize,
          height: hamburgerSize,
          position: 'relative',
          transform: isMobileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: `transform ${animationDuration} ease`
        }}
      >
        {isMobileMenuOpen ? <X size={parseInt(hamburgerSize)} /> : <Menu size={parseInt(hamburgerSize)} />}
      </div>
    </button>
  );

  // Close Button Component
  const CloseButton = () => (
    showCloseButton && (
      <button
        onClick={() => setIsMobileMenuOpen(false)}
        style={{
          position: 'absolute',
          [closeButtonPosition.includes('top') ? 'top' : 'bottom']: '20px',
          [closeButtonPosition.includes('right') ? 'right' : 'left']: '20px',
          background: 'none',
          border: 'none',
          fontSize: '24px',
          color: mobileMenuTextColor,
          cursor: 'pointer',
          zIndex: 1002,
          padding: '8px',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: `background-color ${animationDuration} ease`
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        aria-label="Close mobile menu"
      >
        ×
      </button>
    )
  );

  // Mobile Menu Component
  const MobileMenu = () => {
    if (!isMobile || !isMobileMenuOpen) return null;

    const getMenuStyles = () => {
      const baseStyles = {
        position: 'fixed' as const,
        top: 0,
        zIndex: 1000,
        backgroundColor: mobileMenuBg,
        transition: `all ${animationDuration} ease`,
        display: 'flex',
        flexDirection: 'column' as const,
        overflowY: 'auto' as const
      };

      switch (mobileMenuStyle) {
        case 'fullscreen':
          return {
            ...baseStyles,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            transform: isMobileMenuOpen ? 'scale(1)' : 'scale(0.95)',
            opacity: isMobileMenuOpen ? 1 : 0,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: '60px'
          };
        
        case 'slide-right':
          return {
            ...baseStyles,
            right: 0,
            width: '300px',
            height: '100vh',
            transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
            paddingTop: '60px'
          };
        
        case 'slide-left':
          return {
            ...baseStyles,
            left: 0,
            width: '300px',
            height: '100vh',
            transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
            paddingTop: '60px'
          };
        
        default:
          return baseStyles;
      }
    };

    return (
      <>
        {/* Overlay */}
        {(mobileMenuStyle === 'slide-right' || mobileMenuStyle === 'slide-left') && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: mobileMenuOverlayBg,
              zIndex: 999,
              opacity: isMobileMenuOpen ? 1 : 0,
              visibility: isMobileMenuOpen ? 'visible' : 'hidden',
              transition: `all ${animationDuration} ease`
            }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Mobile Menu */}
        <div style={getMenuStyles()}>
          <CloseButton />
          
          <nav
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              maxWidth: mobileMenuStyle === 'fullscreen' ? '400px' : '100%'
            }}
          >
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleLinkClick(item)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '1rem 1.5rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: mobileMenuTextColor,
                  fontSize: navFontSize,
                  fontWeight: navFontWeight,
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  transition: `background-color ${animationDuration} ease`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {item.icon && <span style={{ fontSize: '20px' }}>{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </>
    );
  };

  // Desktop Navigation
  const DesktopNavigation = () => {
    if (!showNavigation || loading) return null;

    return (
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem'
        }}
      >
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleLinkClick(item)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: navColor,
              fontSize: navFontSize,
              fontWeight: navFontWeight,
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              transition: `color ${animationDuration} ease`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = navHoverColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = navColor;
            }}
          >
            {item.icon && <span>{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    );
  };

  return (
    <>
      <header
        className={`simple-header ${sticky ? 'sticky top-0 z-50' : ''}`}
        style={{
          backgroundColor,
          borderBottom: borderBottom ? '1px solid #e5e7eb' : 'none',
          boxShadow: sticky ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          width: '100%'
        }}
      >
        <div
          style={{
            maxWidth,
            margin: '0 auto',
            padding,
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          {/* Logo Section */}
          <div 
            className="header-logo-zone" 
            style={{ 
              flex: '0 0 auto',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={logoText} 
                style={{ 
                  height: logoSize, 
                  width: 'auto',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <span
                style={{
                  fontSize: logoSize,
                  fontWeight: 'bold',
                  color: navColor
                }}
              >
                {logoText}
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div 
              className="header-navigation-zone desktop-navigation" 
              style={{ 
                flex: '1 1 auto', 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <DesktopNavigation />
            </div>
          )}

          {/* Desktop Actions */}
          {!isMobile && (
            <div 
              className="header-actions-zone desktop-actions" 
              style={{ 
                flex: '0 0 auto',
                minWidth: '150px',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <DropZone zone="actions" />
              <UserSessionIndicator variant="header" />
            </div>
          )}

          {/* Mobile Section */}
          {isMobile && (
            <div className="flex items-center gap-3">
              {/* Mobile Actions */}
              <div className="mobile-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DropZone zone="actions" />
                <UserSessionIndicator variant="floating" />
              </div>
              
              {/* Hamburger Menu Button */}
              <HamburgerButton />
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu />
    </>
  );
};

// Simple Header Configuration
export const simpleHeaderConfig = {
  fields: {
    backgroundColor: {
      type: 'text' as const,
      label: 'Background Color',
    },
    height: {
      type: 'text' as const,
      label: 'Height',
    },
    borderBottom: {
      type: 'radio' as const,
      label: 'Show Border Bottom',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    sticky: {
      type: 'radio' as const,
      label: 'Sticky Header',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    maxWidth: {
      type: 'text' as const,
      label: 'Max Width',
    },
    padding: {
      type: 'text' as const,
      label: 'Padding',
    },
    logoText: {
      type: 'text' as const,
      label: 'Logo Text',
    },
    logoUrl: {
      type: 'text' as const,
      label: 'Logo URL',
    },
    logoSize: {
      type: 'text' as const,
      label: 'Logo Size',
    },
    showNavigation: {
      type: 'radio' as const,
      label: 'Show Navigation',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    showHomepage: {
      type: 'radio' as const,
      label: 'Show Homepage',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
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
    maxItems: {
      type: 'number' as const,
      label: 'Max Items',
      min: 1,
      max: 10,
    },
    externalLinks: {
      type: 'array' as const,
      label: 'External Links',
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
          label: 'Icon',
        },
        order: {
          type: 'number' as const,
          label: 'Order',
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
      getItemSummary: (item: NavigationItem) => item.label,
    },
    mobileMenuStyle: {
      type: 'select' as const,
      label: 'Mobile Menu Style',
      options: [
        { label: 'Fullscreen', value: 'fullscreen' },
        { label: 'Slide Right', value: 'slide-right' },
        { label: 'Slide Left', value: 'slide-left' },
      ],
    },
    mobileBreakpoint: {
      type: 'number' as const,
      label: 'Mobile Breakpoint (px)',
      min: 320,
      max: 1024,
    },
    hamburgerColor: {
      type: 'text' as const,
      label: 'Hamburger Color',
    },
    hamburgerSize: {
      type: 'text' as const,
      label: 'Hamburger Size',
    },
    mobileMenuBg: {
      type: 'text' as const,
      label: 'Mobile Menu Background Color',
    },
    mobileMenuTextColor: {
      type: 'text' as const,
      label: 'Mobile Menu Text Color',
    },
    mobileMenuOverlayBg: {
      type: 'text' as const,
      label: 'Mobile Menu Overlay Background Color',
    },
    animationDuration: {
      type: 'text' as const,
      label: 'Animation Duration',
    },
    showCloseButton: {
      type: 'radio' as const,
      label: 'Show Close Button',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    closeButtonPosition: {
      type: 'select' as const,
      label: 'Close Button Position',
      options: [
        { label: 'Top Left', value: 'top-left' },
        { label: 'Top Right', value: 'top-right' },
      ],
    },
    navFontSize: {
      type: 'text' as const,
      label: 'Navigation Font Size',
    },
    navFontWeight: {
      type: 'text' as const,
      label: 'Navigation Font Weight',
    },
    navColor: {
      type: 'text' as const,
      label: 'Navigation Color',
    },
    navHoverColor: {
      type: 'text' as const,
      label: 'Navigation Hover Color',
    },
  },
  defaultProps: {
    backgroundColor: '#ffffff',
    height: '70px',
    borderBottom: true,
    sticky: true,
    maxWidth: '1200px',
    padding: '0 1rem',
    logoText: 'Your Church',
    logoUrl: '',
    logoSize: '32px',
    showNavigation: true,
    showHomepage: true,
    showIcons: false,
    maxItems: 6,
    externalLinks: [],
    mobileMenuStyle: 'slide-right',
    mobileBreakpoint: 768,
    hamburgerColor: '#374151',
    hamburgerSize: '24px',
    mobileMenuBg: '#ffffff',
    mobileMenuTextColor: '#374151',
    mobileMenuOverlayBg: 'rgba(0, 0, 0, 0.5)',
    animationDuration: '300ms',
    showCloseButton: true,
    closeButtonPosition: 'top-right',
    navFontSize: '16px',
    navFontWeight: '500',
    navColor: '#374151',
    navHoverColor: '#1f2937',
  },
  render: SimpleHeader,
};

export default SimpleHeader; 