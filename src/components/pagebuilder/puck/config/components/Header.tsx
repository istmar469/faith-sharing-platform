
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ComponentConfig } from '@measured/puck';
import { Search, User, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { getOrganizationPages } from '@/services/pageService';
import { useTenantContext } from '@/components/context/TenantContext';
import MobileNavigation from '@/components/navigation/MobileNavigation';
import SortableNavigationItem, { NavigationPage } from './header/SortableNavigationItem';
import { useNavigationHandlers, createNavigationItems } from './header/navigationUtils';
import { headerConfig } from './header/headerConfig';
import { HeaderProps } from './header/types';

const Header: React.FC<HeaderProps> = React.memo((rawProps) => {
  // Create safe props with comprehensive validation - memoized to prevent re-creation
  const safeProps = useMemo(() => ({
    // Logo settings with safe defaults
    logo: typeof rawProps.logo === 'string' ? rawProps.logo : undefined,
    logoText: typeof rawProps.logoText === 'string' ? rawProps.logoText : 'My Church',
    logoSize: typeof rawProps.logoSize === 'number' && rawProps.logoSize > 0 ? rawProps.logoSize : 32,
    logoPosition: ['left', 'center', 'right'].includes(rawProps.logoPosition as string) ? rawProps.logoPosition : 'left',
    
    // Background settings with safe defaults
    backgroundColor: typeof rawProps.backgroundColor === 'string' ? rawProps.backgroundColor : '#ffffff',
    backgroundType: ['solid', 'gradient'].includes(rawProps.backgroundType as string) ? rawProps.backgroundType : 'solid',
    gradientFrom: typeof rawProps.gradientFrom === 'string' ? rawProps.gradientFrom : '#3b82f6',
    gradientTo: typeof rawProps.gradientTo === 'string' ? rawProps.gradientTo : '#1d4ed8',
    gradientDirection: ['to-r', 'to-l', 'to-t', 'to-b', 'to-br', 'to-bl'].includes(rawProps.gradientDirection as string) ? rawProps.gradientDirection : 'to-r',
    
    // Colors with safe defaults
    textColor: typeof rawProps.textColor === 'string' ? rawProps.textColor : '#1f2937',
    linkColor: typeof rawProps.linkColor === 'string' ? rawProps.linkColor : '#4b5563',
    linkHoverColor: typeof rawProps.linkHoverColor === 'string' ? rawProps.linkHoverColor : '#3b82f6',
    
    // Layout settings with safe defaults
    height: typeof rawProps.height === 'number' && rawProps.height > 0 ? rawProps.height : 64,
    paddingX: typeof rawProps.paddingX === 'number' && rawProps.paddingX >= 0 ? rawProps.paddingX : 16,
    paddingY: typeof rawProps.paddingY === 'number' && rawProps.paddingY >= 0 ? rawProps.paddingY : 12,
    borderWidth: typeof rawProps.borderWidth === 'number' && rawProps.borderWidth >= 0 ? rawProps.borderWidth : 0,
    borderColor: typeof rawProps.borderColor === 'string' ? rawProps.borderColor : '#e5e7eb',
    borderRadius: typeof rawProps.borderRadius === 'number' && rawProps.borderRadius >= 0 ? rawProps.borderRadius : 0,
    shadow: ['none', 'sm', 'md', 'lg', 'xl'].includes(rawProps.shadow as string) ? rawProps.shadow : 'sm',
    maxWidth: ['full', 'container', 'lg', 'xl', '2xl'].includes(rawProps.maxWidth as string) ? rawProps.maxWidth : 'container',
    
    // Behavior settings with safe defaults
    isSticky: Boolean(rawProps.isSticky),
    showNavigation: Boolean(rawProps.showNavigation !== false), // Default to true
    showSearch: Boolean(rawProps.showSearch),
    showUserMenu: Boolean(rawProps.showUserMenu),
    enablePageManagement: Boolean(rawProps.enablePageManagement !== false), // Default to true
    layout: ['default', 'centered', 'minimal', 'split'].includes(rawProps.layout as string) ? rawProps.layout : 'default',
    navigationStyle: ['horizontal', 'dropdown', 'mega-menu'].includes(rawProps.navigationStyle as string) ? rawProps.navigationStyle : 'horizontal',
    animationStyle: ['none', 'fade', 'slide', 'scale'].includes(rawProps.animationStyle as string) ? rawProps.animationStyle : 'fade',
    
    // Typography settings with safe defaults
    fontFamily: typeof rawProps.fontFamily === 'string' ? rawProps.fontFamily : 'system-ui',
    fontSize: typeof rawProps.fontSize === 'number' && rawProps.fontSize > 0 ? rawProps.fontSize : 14,
    fontWeight: ['normal', 'medium', 'semibold', 'bold'].includes(rawProps.fontWeight as string) ? rawProps.fontWeight : 'medium',
    
    // Custom items with safe defaults
    customNavigationItems: Array.isArray(rawProps.customNavigationItems) ? rawProps.customNavigationItems : [],
    organizationBranding: typeof rawProps.organizationBranding === 'object' && rawProps.organizationBranding !== null ? rawProps.organizationBranding : {}
  }), [rawProps]);

  // Destructure safe props
  const {
    logo, logoText, logoSize, logoPosition,
    backgroundColor, backgroundType, gradientFrom, gradientTo, gradientDirection,
    textColor, linkColor, linkHoverColor,
    height, paddingX, paddingY, borderWidth, borderColor, borderRadius, shadow, maxWidth,
    isSticky, showNavigation, showSearch, showUserMenu, enablePageManagement,
    layout, navigationStyle, animationStyle,
    fontFamily, fontSize, fontWeight,
    customNavigationItems, organizationBranding
  } = safeProps;

  const [pages, setPages] = useState<NavigationPage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPageManagerOpen, setIsPageManagerOpen] = useState(false);
  const { organizationId } = useTenantContext() || {};

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { handleEditPage, handleCreateNewPage, handleNavigationClick } = useNavigationHandlers();

  // Stable fetch function to prevent infinite loops
  const fetchPages = useCallback(async () => {
    if (!organizationId || isLoading) {
      setPages([]);
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await getOrganizationPages(organizationId, 1, 50);
      
      if (!result || !Array.isArray(result.data)) {
        setPages([]);
        return;
      }
      
      const navigationPages: NavigationPage[] = result.data
        .filter(page => page && typeof page === 'object' && page.id && page.title && page.slug)
        .map(page => ({
          id: page.id!,
          title: page.title || 'Untitled',
          slug: page.slug || 'untitled',
          is_homepage: Boolean(page.is_homepage),
          published: Boolean(page.published),
          show_in_navigation: Boolean(page.show_in_navigation ?? true),
          order: 0
        }));
      
      navigationPages.sort((a, b) => {
        if (a.is_homepage) return -1;
        if (b.is_homepage) return 1;
        return a.title.localeCompare(b.title);
      });
      
      setPages(navigationPages);
    } catch (error) {
      console.error('Header: Error fetching pages:', error);
      setPages([]);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, isLoading]);

  // Only fetch once when organizationId changes
  useEffect(() => {
    if (organizationId && !isLoading) {
      fetchPages();
    }
  }, [organizationId]);

  // Memoize handlers to prevent re-creation
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const handleTogglePageVisibility = useCallback((pageId: string, visible: boolean) => {
    setPages(prevPages => 
      prevPages.map(page => 
        page.id === pageId 
          ? { ...page, show_in_navigation: visible }
          : page
      )
    );
  }, []);

  // Memoize style calculations
  const backgroundStyle = useMemo(() => {
    if (backgroundType === 'gradient') {
      return {
        background: `linear-gradient(${gradientDirection}, ${gradientFrom}, ${gradientTo})`
      };
    }
    return { backgroundColor };
  }, [backgroundType, gradientDirection, gradientFrom, gradientTo, backgroundColor]);

  const headerStyle = useMemo(() => ({
    ...backgroundStyle,
    color: textColor,
    height: `${height}px`,
    paddingLeft: `${paddingX}px`,
    paddingRight: `${paddingX}px`,
    paddingTop: `${paddingY}px`,
    paddingBottom: `${paddingY}px`,
    borderWidth: `${borderWidth}px`,
    borderColor,
    borderRadius: `${borderRadius}px`,
    fontFamily,
    fontSize: `${fontSize}px`,
    fontWeight,
    boxShadow: shadow === 'none' ? 'none' : `var(--shadow-${shadow})`,
  }), [backgroundStyle, textColor, height, paddingX, paddingY, borderWidth, borderColor, borderRadius, fontFamily, fontSize, fontWeight, shadow]);

  const containerClasses = useMemo(() => {
    const baseClasses = "mx-auto";
    switch (maxWidth) {
      case 'full': return `${baseClasses} w-full`;
      case 'container': return `${baseClasses} container`;
      case 'lg': return `${baseClasses} max-w-4xl`;
      case 'xl': return `${baseClasses} max-w-6xl`;
      case '2xl': return `${baseClasses} max-w-7xl`;
      default: return `${baseClasses} container`;
    }
  }, [maxWidth]);

  // Memoize navigation items
  const allNavigationItems = useMemo(() => 
    createNavigationItems(pages, customNavigationItems), 
    [pages, customNavigationItems]
  );

  return (
    <header 
      className={`${isSticky ? 'sticky top-0 z-50' : ''} border-solid transition-all duration-300`}
      style={headerStyle}
    >
      <div className={containerClasses}>
        {/* Mobile Navigation */}
        <div className="md:hidden">
          <MobileNavigation
            logo={logo}
            logoText={logoText}
            items={allNavigationItems.map(item => ({
              id: item.href,
              label: item.label,
              href: item.href,
              target: item.isExternal ? '_blank' : '_self',
            }))}
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between">
          {/* Logo Section */}
          <div className={`flex items-center ${logoPosition === 'center' ? 'justify-center' : ''}`}>
            {logo ? (
              <img 
                src={logo} 
                alt={logoText} 
                style={{ height: `${logoSize}px`, width: 'auto' }}
                className="object-contain"
              />
            ) : (
              <h1 
                className="font-bold"
                style={{ 
                  color: organizationBranding.primaryColor || textColor,
                  fontFamily: organizationBranding.fontFamily || fontFamily,
                  fontSize: `${logoSize * 0.75}px`
                }}
              >
                {logoText}
              </h1>
            )}
          </div>

          {/* Navigation Section */}
          {showNavigation && allNavigationItems.length > 0 && (
            <nav className="hidden md:flex items-center space-x-6">
              {allNavigationItems.map((item, index) => {
                if (!item || typeof item !== 'object' || !item.label || !item.href) {
                  return null;
                }
                
                return (
                  <button
                    key={`nav-${index}-${item.href}`}
                    onClick={() => handleNavigationClick(item.href, item.isExternal)}
                    className="transition-colors duration-200 hover:opacity-80 bg-transparent border-none cursor-pointer"
                    style={{ 
                      color: linkColor,
                      fontWeight
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = linkHoverColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = linkColor;
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          )}
          
          <div className="flex items-center space-x-4">
            {/* Search Section */}
            {showSearch && (
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ fontSize: `${fontSize}px` }}
                />
              </div>
            )}

            {/* Page Manager Section */}
            {enablePageManagement && (
              <Dialog open={isPageManagerOpen} onOpenChange={setIsPageManagerOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden md:flex">
                    <Settings className="h-4 w-4 mr-1" />
                    Manage Pages
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Manage Navigation</DialogTitle>
                    <DialogDescription>
                      Drag to reorder pages and toggle their visibility in the navigation menu.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Navigation Pages</h3>
                      <Button onClick={handleCreateNewPage} size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        New Page
                      </Button>
                    </div>
                    
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
                        <p className="mt-2 text-sm text-gray-600">Loading pages...</p>
                      </div>
                    ) : pages.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600">No pages found.</p>
                        <Button onClick={handleCreateNewPage} className="mt-2">
                          Create your first page
                        </Button>
                      </div>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={pages.map(page => page.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {pages.map((page) => (
                              <SortableNavigationItem
                                key={page.id}
                                page={page}
                                onToggleVisibility={handleTogglePageVisibility}
                                onEditPage={handleEditPage}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* User Menu Section */}
            {showUserMenu && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white z-50">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export { headerConfig };
export default Header;
