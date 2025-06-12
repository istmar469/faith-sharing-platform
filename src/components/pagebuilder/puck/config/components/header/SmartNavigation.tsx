import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/components/context/TenantContext';

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  openInNewTab?: boolean;
  icon?: string;
  order?: number;
  type: 'page' | 'external';
  pageId?: string;
}

export type MobileMenuStyle = 'fullscreen' | 'slide-right' | 'slide-left';

export interface SmartNavigationProps {
  externalLinks?: NavigationItem[];
  layout?: 'horizontal' | 'vertical';
  spacing?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  hoverColor?: string;
  showIcons?: boolean;
  showHomepage?: boolean;
  maxItems?: number;
  enableReordering?: boolean;
  enableLinkManagement?: boolean;
  // Mobile Navigation Props
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
  puck?: any;
}

export const SmartNavigation: React.FC<SmartNavigationProps> = ({
  externalLinks = [],
  layout = 'horizontal',
  spacing = '2rem',
  fontSize = '16px',
  fontWeight = '500',
  color = '#374151',
  hoverColor = '#1f2937',
  showIcons = false,
  showHomepage = true,
  maxItems = 6,
  enableReordering = false,
  enableLinkManagement = false,
  // Mobile Navigation Defaults
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
  puck
}) => {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddLinkForm, setShowAddLinkForm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [newLink, setNewLink] = useState({
    label: '',
    url: '',
    icon: '',
    openInNewTab: false
  });
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

  useEffect(() => {
    if (organizationId) {
      fetchNavigationItems();
    }
  }, [organizationId, externalLinks]);

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
          type: 'external',
          order: link.order || (navItems.length + index)
        });
      });

      // Sort by order and limit items
      navItems.sort((a, b) => (a.order || 0) - (b.order || 0));
      setNavigationItems(navItems.slice(0, maxItems));

      // Update Puck with current navigation items for the sidebar
      if (puck && puck.onChange) {
        puck.onChange({
          ...puck.data,
          props: {
            ...puck.data.props,
            currentNavigationItems: navItems.slice(0, maxItems)
          }
        });
      }
    } catch (error) {
      console.error('Error in fetchNavigationItems:', error);
      setNavigationItems([]);
    } finally {
      setLoading(false);
    }
  };

  const getPageIcon = (title: string): string => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('about')) return 'ℹ️';
    if (titleLower.includes('contact')) return '📞';
    if (titleLower.includes('service')) return '⛪';
    if (titleLower.includes('event')) return '📅';
    if (titleLower.includes('blog') || titleLower.includes('news')) return '📝';
    if (titleLower.includes('gallery') || titleLower.includes('photo')) return '📸';
    if (titleLower.includes('donate') || titleLower.includes('giving')) return '💝';
    if (titleLower.includes('ministry') || titleLower.includes('ministries')) return '🙏';
    return '📄';
  };

  const handleDragEnd = async (result: DropResult) => {
    try {
      if (!result.destination || !enableReordering) return;

      const sourceIndex = result.source.index;
      const destinationIndex = result.destination.index;

      if (sourceIndex === destinationIndex) return;

      // Reorder the local state immediately for responsive UI
      const reorderedItems = Array.from(navigationItems);
      const [removed] = reorderedItems.splice(sourceIndex, 1);
      reorderedItems.splice(destinationIndex, 0, removed);
      setNavigationItems(reorderedItems);

      // Update the database for pages only
      try {
        const updatePromises = reorderedItems
          .filter(item => item.type === 'page' && item.pageId)
          .map((item, index) => {
            // Skip homepage as it should always be first
            if (item.url === '/') return Promise.resolve();
            
            return supabase
              .from('pages')
              .update({ display_order: index })
              .eq('id', item.pageId);
          });

        await Promise.all(updatePromises);
        
        console.log('Navigation order updated successfully');

        // Update Puck with new order
        if (puck && puck.onChange) {
          puck.onChange({
            ...puck.data,
            props: {
              ...puck.data.props,
              currentNavigationItems: reorderedItems
            }
          });
        }
      } catch (error) {
        console.error('Error updating navigation order:', error);
        // Revert the local state on error
        fetchNavigationItems();
      }
    } catch (error) {
      console.error('Error in handleDragEnd:', error);
    }
  };

  const handleAddExternalLink = () => {
    if (!newLink.label || !newLink.url) return;

    const link: NavigationItem = {
      id: `external-${Date.now()}`,
      label: newLink.label,
      url: newLink.url,
      icon: newLink.icon || undefined,
      openInNewTab: newLink.openInNewTab,
      type: 'external',
      order: navigationItems.length
    };

    const updatedItems = [...navigationItems, link];
    setNavigationItems(updatedItems);

    // Update external links in Puck
    if (puck && puck.onChange) {
      const updatedExternalLinks = [...externalLinks, link];
      puck.onChange({
        ...puck.data,
        props: {
          ...puck.data.props,
          externalLinks: updatedExternalLinks,
          currentNavigationItems: updatedItems
        }
      });
    }

    // Reset form
    setNewLink({ label: '', url: '', icon: '', openInNewTab: false });
    setShowAddLinkForm(false);
  };

  const handleRemoveExternalLink = (linkId: string) => {
    const updatedItems = navigationItems.filter(item => item.id !== linkId);
    setNavigationItems(updatedItems);

    // Update external links in Puck
    if (puck && puck.onChange) {
      const updatedExternalLinks = externalLinks.filter(link => link.id !== linkId);
      puck.onChange({
        ...puck.data,
        props: {
          ...puck.data.props,
          externalLinks: updatedExternalLinks,
          currentNavigationItems: updatedItems
        }
      });
    }
  };

  const handleMobileMenuItemClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Hamburger Menu Component
  const HamburgerButton = () => (
    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: hamburgerSize,
        height: hamburgerSize,
        position: 'relative',
        zIndex: 1001
      }}
      aria-label="Toggle mobile menu"
    >
      <div
        style={{
          width: '20px',
          height: '2px',
          backgroundColor: hamburgerColor,
          transition: `all ${animationDuration} ease`,
          transform: isMobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
          marginBottom: isMobileMenuOpen ? '0' : '3px'
        }}
      />
      <div
        style={{
          width: '20px',
          height: '2px',
          backgroundColor: hamburgerColor,
          transition: `all ${animationDuration} ease`,
          opacity: isMobileMenuOpen ? 0 : 1,
          marginBottom: isMobileMenuOpen ? '0' : '3px'
        }}
      />
      <div
        style={{
          width: '20px',
          height: '2px',
          backgroundColor: hamburgerColor,
          transition: `all ${animationDuration} ease`,
          transform: isMobileMenuOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none'
        }}
      />
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

  const renderNavigationItem = (item: NavigationItem, index: number, isDragging?: boolean, isInDragContext?: boolean, isMobileItem?: boolean) => (
    <div
      key={item.id}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: isMobileItem ? '1rem 1.5rem' : '0.5rem 1rem',
        backgroundColor: isDragging ? '#f3f4f6' : 'transparent',
        borderRadius: isMobileItem ? '0' : '0.375rem',
        transform: isDragging ? 'rotate(2deg)' : 'none',
        boxShadow: isDragging ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
        opacity: isDragging ? 0.8 : 1,
        transition: `all ${animationDuration} ease`,
        cursor: isInDragContext && enableReordering ? 'grab' : 'pointer',
        border: isDragging ? '2px dashed #3b82f6' : isMobileItem ? 'none' : '1px solid transparent',
        borderBottom: isMobileItem ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
        minWidth: layout === 'horizontal' && !isMobileItem ? 'auto' : '200px',
        width: isMobileItem ? '100%' : 'auto'
      }}
    >
      {isInDragContext && enableReordering && (
        <span 
          style={{ 
            color: '#6b7280', 
            fontSize: '12px',
            cursor: 'grab',
            userSelect: 'none'
          }}
        >
          ⋮⋮
        </span>
      )}
      
      {item.icon && (
        <span style={{ fontSize: isMobileItem ? '20px' : '16px' }}>
          {item.icon}
        </span>
      )}
      
      <a
        href={item.url}
        target={item.openInNewTab ? '_blank' : '_self'}
        rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
        onClick={isMobileItem ? handleMobileMenuItemClick : undefined}
        style={{
          textDecoration: 'none',
          color: isMobileItem ? mobileMenuTextColor : color,
          fontSize: isMobileItem ? '18px' : fontSize,
          fontWeight: fontWeight,
          transition: `color ${animationDuration} ease`,
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          flex: 1
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = hoverColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = isMobileItem ? mobileMenuTextColor : color;
        }}
      >
        {item.label}
        {item.type === 'external' && item.openInNewTab && (
          <span style={{ fontSize: isMobileItem ? '14px' : '12px', opacity: 0.7 }}>↗</span>
        )}
      </a>

      {isInDragContext && enableLinkManagement && item.type === 'external' && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleRemoveExternalLink(item.id);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '2px 4px',
            borderRadius: '2px',
            marginLeft: 'auto'
          }}
          title="Remove external link"
        >
          ×
        </button>
      )}
    </div>
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
            {navigationItems.map((item, index) => (
              <div key={item.id}>
                {renderNavigationItem(item, index, false, false, true)}
              </div>
            ))}
          </nav>
        </div>
      </>
    );
  };

  const renderLinkManagement = () => {
    if (!enableLinkManagement) return null;

    return (
      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
          Link Management
        </h4>
        
        {!showAddLinkForm ? (
          <button
            onClick={() => setShowAddLinkForm(true)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            + Add External Link
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="text"
              placeholder="Link label"
              value={newLink.label}
              onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '14px'
              }}
            />
            <input
              type="url"
              placeholder="Link URL"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '14px'
              }}
            />
            <input
              type="text"
              placeholder="Icon (emoji or text)"
              value={newLink.icon}
              onChange={(e) => setNewLink({ ...newLink, icon: e.target.value })}
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '14px'
              }}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={newLink.openInNewTab}
                onChange={(e) => setNewLink({ ...newLink, openInNewTab: e.target.checked })}
              />
              Open in new tab
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleAddExternalLink}
                disabled={!newLink.label || !newLink.url}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: newLink.label && newLink.url ? '#10b981' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: newLink.label && newLink.url ? 'pointer' : 'not-allowed',
                  fontSize: '14px'
                }}
              >
                Add Link
              </button>
              <button
                onClick={() => {
                  setShowAddLinkForm(false);
                  setNewLink({ label: '', url: '', icon: '', openInNewTab: false });
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
        Loading navigation...
      </div>
    );
  }

  // Desktop Navigation Content
  const navigationContent = enableReordering ? (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="navigation" direction={layout === 'horizontal' ? 'horizontal' : 'vertical'}>
        {(provided) => (
          <nav
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              display: 'flex',
              flexDirection: layout === 'horizontal' ? 'row' : 'column',
              gap: spacing,
              alignItems: layout === 'horizontal' ? 'center' : 'stretch',
              width: '100%'
            }}
          >
            {navigationItems.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      margin: 0
                    }}
                  >
                    {renderNavigationItem(item, index, snapshot.isDragging, true)}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </nav>
        )}
      </Droppable>
    </DragDropContext>
  ) : (
    <nav
      style={{
        display: 'flex',
        flexDirection: layout === 'horizontal' ? 'row' : 'column',
        gap: spacing,
        alignItems: layout === 'horizontal' ? 'center' : 'stretch',
        width: '100%'
      }}
      ref={puck?.dragRef}
    >
      {navigationItems.map((item, index) => (
        <div key={item.id}>
          {renderNavigationItem(item, index, false, false)}
        </div>
      ))}
    </nav>
  );

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Desktop Navigation */}
      <div style={{ display: isMobile ? 'none' : 'block' }}>
        {navigationContent}
      </div>
      
      {/* Mobile Hamburger Button */}
      <div style={{ display: isMobile ? 'block' : 'none' }}>
        <HamburgerButton />
      </div>
      
      {/* Mobile Menu */}
      <MobileMenu />
      
      {/* Link Management (Desktop Only) */}
      {!isMobile && renderLinkManagement()}
    </div>
  );
};

// SmartNavigation Component Configuration for Puck
export const smartNavigationConfig = {
  fields: {
    currentNavigationItems: {
      type: 'array' as const,
      label: 'Current Navigation Items',
      arrayFields: {
        id: {
          type: 'text' as const,
          label: 'ID',
          readOnly: true,
        },
        label: {
          type: 'text' as const,
          label: 'Label',
        },
        url: {
          type: 'text' as const,
          label: 'URL',
          readOnly: true,
        },
        type: {
          type: 'text' as const,
          label: 'Type',
          readOnly: true,
        },
        order: {
          type: 'number' as const,
          label: 'Order',
        },
      },
      getItemSummary: (item: NavigationItem) => `${item.label} (${item.type})`,
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
      getItemSummary: (item: NavigationItem) => item.label,
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
    showHomepage: {
      type: 'radio' as const,
      label: 'Show Homepage Link',
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
    enableReordering: {
      type: 'radio' as const,
      label: 'Enable Drag & Drop Reordering',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    enableLinkManagement: {
      type: 'radio' as const,
      label: 'Enable Link Management Interface',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    // Mobile Navigation Settings
    mobileMenuStyle: {
      type: 'select' as const,
      label: 'Mobile Menu Style',
      options: [
        { label: 'Full Screen Overlay', value: 'fullscreen' },
        { label: 'Slide from Right', value: 'slide-right' },
        { label: 'Slide from Left', value: 'slide-left' },
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
      label: 'Hamburger Menu Color',
    },
    hamburgerSize: {
      type: 'text' as const,
      label: 'Hamburger Menu Size',
    },
    mobileMenuBg: {
      type: 'text' as const,
      label: 'Mobile Menu Background',
    },
    mobileMenuTextColor: {
      type: 'text' as const,
      label: 'Mobile Menu Text Color',
    },
    mobileMenuOverlayBg: {
      type: 'text' as const,
      label: 'Mobile Menu Overlay Background',
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
        { label: 'Top Right', value: 'top-right' },
        { label: 'Top Left', value: 'top-left' },
      ],
    },
    // Existing Desktop Settings
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
    currentNavigationItems: [],
    externalLinks: [],
    layout: 'horizontal',
    showIcons: false,
    showHomepage: true,
    maxItems: 6,
    enableReordering: false,
    enableLinkManagement: false,
    // Mobile Navigation Defaults
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
    // Desktop Defaults
    spacing: '2rem',
    fontSize: '16px',
    fontWeight: '500',
    color: '#374151',
    hoverColor: '#1f2937',
  },
  render: SmartNavigation,
};

export default SmartNavigation; 