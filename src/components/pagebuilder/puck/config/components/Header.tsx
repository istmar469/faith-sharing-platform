
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ComponentConfig } from '@measured/puck';
import { ChevronDown, Menu, X, Search, User, Globe, Settings, Edit3, Plus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
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
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getOrganizationPages } from '@/services/pageService';
import { useTenantContext } from '@/components/context/TenantContext';
import MobileNavigation from '@/components/navigation/MobileNavigation';

export interface NavigationPage {
  id: string;
  title: string;
  slug: string;
  is_homepage: boolean;
  published: boolean;
  show_in_navigation: boolean;
  order?: number;
}

export interface HeaderCustomization {
  logo?: string;
  logoText?: string;
  logoSize?: number;
  logoPosition?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  backgroundType?: 'solid' | 'gradient';
  gradientFrom?: string;
  gradientTo?: string;
  gradientDirection?: 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-br' | 'to-bl';
  textColor?: string;
  linkColor?: string;
  linkHoverColor?: string;
  height?: number;
  paddingX?: number;
  paddingY?: number;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  isSticky?: boolean;
  showSearch?: boolean;
  showUserMenu?: boolean;
  layout?: 'default' | 'centered' | 'minimal' | 'split';
  navigationStyle?: 'horizontal' | 'dropdown' | 'mega-menu';
  animationStyle?: 'none' | 'fade' | 'slide' | 'scale';
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

export interface HeaderProps extends HeaderCustomization {
  showNavigation?: boolean;
  enablePageManagement?: boolean;
  customNavigationItems?: Array<{
    label: string;
    href: string;
    isExternal?: boolean;
  }>;
  maxWidth?: 'full' | 'container' | 'lg' | 'xl' | '2xl';
  organizationBranding?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
}

interface SortableNavigationItemProps {
  page: NavigationPage;
  onToggleVisibility: (pageId: string, visible: boolean) => void;
  onEditPage: (pageId: string) => void;
}

const SortableNavigationItem: React.FC<SortableNavigationItemProps> = React.memo(({
  page,
  onToggleVisibility,
  onEditPage
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
    >
      <div className="flex items-center space-x-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <GripVertical size={16} />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">{page.title}</span>
            {page.is_homepage && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Home
              </span>
            )}
            {!page.published && (
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                Draft
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">/{page.slug}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          checked={page.show_in_navigation}
          onCheckedChange={(checked) => onToggleVisibility(page.id, checked)}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEditPage(page.id)}
        >
          <Edit3 size={14} />
        </Button>
      </div>
    </div>
  );
});

SortableNavigationItem.displayName = 'SortableNavigationItem';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPageManagerOpen, setIsPageManagerOpen] = useState(false);
  const { organizationId, organizationName } = useTenantContext() || {};

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleEditPage = useCallback((pageId: string) => {
    const isInPageBuilder = window.location.pathname.includes('/page-builder');
    
    if (isInPageBuilder) {
      const currentParams = new URLSearchParams(window.location.search);
      const organizationParam = currentParams.get('organization_id');
      const newUrl = organizationParam 
        ? `/page-builder/${pageId}?organization_id=${organizationParam}`
        : `/page-builder/${pageId}`;
      
      window.history.pushState({}, '', newUrl);
      window.location.reload();
    } else {
      const currentDomain = window.location.origin;
      const pageEditUrl = `${currentDomain}/page-builder/${pageId}`;
      window.open(pageEditUrl, '_blank');
    }
  }, []);

  const handleCreateNewPage = useCallback(() => {
    const isInPageBuilder = window.location.pathname.includes('/page-builder');
    
    if (isInPageBuilder) {
      const currentParams = new URLSearchParams(window.location.search);
      const organizationParam = currentParams.get('organization_id');
      const newUrl = organizationParam 
        ? `/page-builder/new?organization_id=${organizationParam}`
        : `/page-builder/new`;
      
      window.history.pushState({}, '', newUrl);
      window.location.reload();
    } else {
      const currentDomain = window.location.origin;
      const newPageUrl = `${currentDomain}/page-builder`;
      window.open(newPageUrl, '_blank');
    }
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

  // Memoize visible pages and navigation items
  const visiblePages = useMemo(() => 
    Array.isArray(pages) ? pages.filter(page => 
      page && 
      typeof page === 'object' && 
      page.show_in_navigation && 
      page.published && 
      page.title && 
      page.slug
    ) : [], [pages]);

  const allNavigationItems = useMemo(() => [
    ...visiblePages.map(page => {
      if (!page || typeof page !== 'object' || !page.title) {
        return null;
      }
      
      return {
        label: page.title,
        href: page.is_homepage ? '/' : `/${page.slug}`,
        isExternal: false
      };
    }).filter(Boolean),
    ...(Array.isArray(customNavigationItems) ? customNavigationItems : [])
  ], [visiblePages, customNavigationItems]);

  // Handle navigation clicks with proper page loading
  const handleNavigationClick = useCallback((href: string, isExternal?: boolean) => {
    if (isExternal) {
      window.open(href, '_blank');
    } else {
      const cleanHref = href.startsWith('/') ? href.substring(1) : href;
      
      if (cleanHref === '' || cleanHref === 'home') {
        window.location.href = '/';
      } else {
        window.location.href = `/${cleanHref}`;
      }
    }
  }, []);

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

export const headerConfig: ComponentConfig<HeaderProps> = {
  label: 'Header',
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
      arrayFields: {
        type: 'object',
        objectFields: {
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
  },
  render: ({ ...props }) => <Header {...props} />
};

export default Header;
