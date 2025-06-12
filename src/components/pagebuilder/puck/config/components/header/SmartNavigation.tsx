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
}

export interface SmartNavigationProps {
  mode?: 'auto' | 'manual';
  items?: NavigationItem[];
  layout?: 'horizontal' | 'vertical';
  spacing?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  hoverColor?: string;
  activeColor?: string;
  showIcons?: boolean;
  showHomepage?: boolean;
  maxItems?: number;
  enableReordering?: boolean;
  puck?: any;
}

export const SmartNavigation: React.FC<SmartNavigationProps> = ({
  mode = 'auto',
  items = [],
  layout = 'horizontal',
  spacing = '2rem',
  fontSize = '16px',
  fontWeight = '500',
  color = '#374151',
  hoverColor = '#1f2937',
  activeColor = '#3b82f6',
  showIcons = false,
  showHomepage = true,
  maxItems = 6,
  enableReordering = false,
  puck
}) => {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileContext, setIsMobileContext] = useState(false);
  const { organizationId } = useTenantContext();

  useEffect(() => {
    if (mode === 'auto' && organizationId) {
      fetchNavigationItems();
    } else {
      setNavigationItems(items);
      setLoading(false);
    }
  }, [mode, organizationId, items]);

  useEffect(() => {
    // Mobile context detection
    const checkMobileContext = () => {
      try {
        if (puck?.dragRef?.current) {
          const mobileNav = puck.dragRef.current.closest('.mobile-navigation');
          setIsMobileContext(!!mobileNav);
        }
      } catch (error) {
        console.warn('SmartNavigation: Error checking mobile context:', error);
        setIsMobileContext(false);
      }
    };

    checkMobileContext();
    const timer = setTimeout(checkMobileContext, 100);
    return () => clearTimeout(timer);
  }, [puck]);

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
            id: homepage.id,
            label: 'Home',
            url: '/',
            icon: showIcons ? '🏠' : undefined,
            order: -1
          });
        }
      }

      // Add other pages
      const otherPages = pages?.filter(page => !page.is_homepage) || [];
      otherPages.slice(0, maxItems - navItems.length).forEach((page, index) => {
        navItems.push({
          id: page.id,
          label: page.title,
          url: `/${page.slug}`,
          icon: showIcons ? getPageIcon(page.title) : undefined,
          order: page.display_order || index
        });
      });

      setNavigationItems(navItems);
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
      if (!result.destination || mode !== 'auto' || !enableReordering || !puck) return;

      const sourceIndex = result.source.index;
      const destinationIndex = result.destination.index;

      if (sourceIndex === destinationIndex) return;

      // Reorder the local state immediately for responsive UI
      const reorderedItems = Array.from(navigationItems);
      const [removed] = reorderedItems.splice(sourceIndex, 1);
      reorderedItems.splice(destinationIndex, 0, removed);
      setNavigationItems(reorderedItems);

      // Update the database
      try {
        const updatePromises = reorderedItems.map((item, index) => {
          // Skip homepage as it should always be first
          if (item.url === '/') return Promise.resolve();
          
          return supabase
            .from('pages')
            .update({ display_order: index })
            .eq('id', item.id);
        });

        await Promise.all(updatePromises);
        
        // Show success feedback if in Puck context
        console.log('Navigation order updated successfully');
      } catch (error) {
        console.error('Error updating navigation order:', error);
        // Revert the local state on error
        fetchNavigationItems();
      }
    } catch (error) {
      console.error('Error in handleDragEnd:', error);
    }
  };

  // Force vertical layout in mobile context
  const effectiveLayout = isMobileContext ? 'vertical' : layout;
  const effectiveSpacing = isMobileContext ? '0' : spacing;

  if (loading && mode === 'auto') {
    return (
      <div 
        ref={puck?.dragRef}
        style={{ 
          padding: '1rem', 
          color: '#6b7280',
          fontSize: '14px',
          fontStyle: 'italic'
        }}
      >
        Loading navigation...
      </div>
    );
  }

  const displayItems = mode === 'auto' ? navigationItems : items;

  if (!displayItems || displayItems.length === 0) {
    return (
      <div 
        ref={puck?.dragRef}
        style={{ 
          padding: '1rem', 
          color: '#6b7280',
          fontSize: '14px',
          fontStyle: 'italic'
        }}
      >
        {mode === 'auto' ? 'No published pages found' : 'No navigation items configured'}
      </div>
    );
  }

  const renderNavigationItem = (item: NavigationItem, index: number, isDragging?: boolean, isInDragContext?: boolean) => (
    <a
      href={item.url}
      target={item.openInNewTab ? '_blank' : '_self'}
      rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
      onClick={(e) => {
        // Prevent navigation when dragging or in drag context during editing
        if (isDragging || (isInDragContext && enableReordering && mode === 'auto' && !!puck)) {
          e.preventDefault();
          return false;
        }
      }}
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
        backgroundColor: isDragging ? '#f3f4f6' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        gap: showIcons && item.icon ? '0.5rem' : '0',
        borderBottom: effectiveLayout === 'vertical' && isMobileContext ? '1px solid #f3f4f6' : 'none',
        opacity: isDragging ? 0.8 : 1,
        transform: isDragging ? 'rotate(2deg)' : 'none',
        boxShadow: isDragging ? '0 4px 8px rgba(0,0,0,0.1)' : 'none',
        cursor: (isInDragContext && enableReordering && mode === 'auto' && !!puck) ? 'grab' : 'pointer'
      }}
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.style.color = hoverColor;
          if (effectiveLayout === 'vertical') {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.transform = 'translateX(4px)';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.color = color;
          if (effectiveLayout === 'vertical') {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.transform = 'translateX(0px)';
          }
        }
      }}
    >
      {enableReordering && mode === 'auto' && isInDragContext && !!puck && (
        <span style={{ 
          fontSize: '12px', 
          color: '#9ca3af', 
          marginRight: '0.5rem',
          cursor: 'grab',
          userSelect: 'none'
        }}>
          ⋮⋮
        </span>
      )}
      {showIcons && item.icon && (
        <span style={{ fontSize: '1rem' }}>{item.icon}</span>
      )}
      <span>{item.label}</span>
    </a>
  );

  // Only enable drag-and-drop in Puck editor context
  const isInPuckEditor = !!puck;
  
  if (enableReordering && mode === 'auto' && isInPuckEditor) {
    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="navigation-items" direction={effectiveLayout === 'horizontal' ? 'horizontal' : 'vertical'}>
          {(provided) => (
            <nav
              {...provided.droppableProps}
              ref={(el) => {
                provided.innerRef(el);
                if (puck?.dragRef) {
                  puck.dragRef.current = el;
                }
              }}
              style={{
                display: 'flex',
                flexDirection: effectiveLayout === 'horizontal' ? 'row' : 'column',
                gap: effectiveSpacing,
                alignItems: effectiveLayout === 'horizontal' ? 'center' : 'stretch',
                width: '100%',
                minHeight: effectiveLayout === 'vertical' ? '50px' : 'auto'
              }}
            >
              {displayItems.map((item, index) => (
                <Draggable key={item.id || `nav-item-${index}`} draggableId={item.id || `nav-item-${index}`} index={index}>
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
    );
  }

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
      {displayItems.map((item, index) => (
        <div key={item.id || `nav-item-${index}`}>
          {renderNavigationItem(item, index, false, false)}
        </div>
      ))}
    </nav>
  );
};

// SmartNavigation Component Configuration for Puck
export const smartNavigationConfig = {
  fields: {
    mode: {
      type: 'radio' as const,
      label: 'Navigation Mode',
      options: [
        { label: 'Auto (from Pages) - Fetches published pages', value: 'auto' },
        { label: 'Manual - Custom navigation items', value: 'manual' },
      ],
    },
    items: {
      type: 'array' as const,
      label: 'Manual Navigation Items',
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
      label: 'Max Items (Auto Mode)',
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
    mode: 'auto',
    items: [
      { id: '1', label: 'Home', url: '/', icon: '🏠', openInNewTab: false },
      { id: '2', label: 'About', url: '/about', icon: 'ℹ️', openInNewTab: false },
      { id: '3', label: 'Contact', url: '/contact', icon: '📞', openInNewTab: false },
    ],
    layout: 'horizontal',
    showIcons: false,
    showHomepage: true,
    maxItems: 6,
    enableReordering: false,
    spacing: '2rem',
    fontSize: '16px',
    fontWeight: '500',
    color: '#374151',
    hoverColor: '#1f2937',
  },
  render: SmartNavigation,
};

export default SmartNavigation; 