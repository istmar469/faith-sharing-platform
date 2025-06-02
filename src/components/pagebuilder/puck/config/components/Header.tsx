import React, { useState, useEffect, useCallback } from 'react';
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

const SortableNavigationItem: React.FC<SortableNavigationItemProps> = ({
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
};

const Header: React.FC<HeaderProps> = (rawProps) => {
  // Create safe props with comprehensive validation
  const safeProps = {
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
  };

  // Destructure safe props
  const {
    // Logo settings
    logo,
    logoText,
    logoSize,
    logoPosition,
    
    // Background settings
    backgroundColor,
    backgroundType,
    gradientFrom,
    gradientTo,
    gradientDirection,
    
    // Colors
    textColor,
    linkColor,
    linkHoverColor,
    
    // Layout settings
    height,
    paddingX,
    paddingY,
    borderWidth,
    borderColor,
    borderRadius,
    shadow,
    maxWidth,
    
    // Behavior
    isSticky,
    showNavigation,
    showSearch,
    showUserMenu,
    enablePageManagement,
    layout,
    navigationStyle,
    animationStyle,
    
    // Typography
    fontFamily,
    fontSize,
    fontWeight,
    
    // Custom items
    customNavigationItems,
    organizationBranding
  } = safeProps;

  const [pages, setPages] = useState<NavigationPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPageManagerOpen, setIsPageManagerOpen] = useState(false);
  const { organizationId, organizationName } = useTenantContext();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch organization pages
  const fetchPages = useCallback(async () => {
    if (!organizationId) return;
    
    try {
      setIsLoading(true);
      const result = await getOrganizationPages(organizationId, 1, 50);
      const navigationPages: NavigationPage[] = result.data.map(page => ({
        id: page.id!,
        title: page.title,
        slug: page.slug,
        is_homepage: page.is_homepage,
        published: page.published,
        show_in_navigation: page.show_in_navigation ?? true,
        order: 0 // Will be managed by sort order
      }));
      
      // Sort pages: homepage first, then by title
      navigationPages.sort((a, b) => {
        if (a.is_homepage) return -1;
        if (b.is_homepage) return 1;
        return a.title.localeCompare(b.title);
      });
      
      setPages(navigationPages);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // Handle drag end for page reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Toggle page visibility in navigation
  const handleTogglePageVisibility = (pageId: string, visible: boolean) => {
    setPages(prevPages => 
      prevPages.map(page => 
        page.id === pageId 
          ? { ...page, show_in_navigation: visible }
          : page
      )
    );
    // Here you could also make an API call to persist the change
  };

  // Navigate to page editor
  const handleEditPage = (pageId: string) => {
    // Check if we're currently in the page builder
    const isInPageBuilder = window.location.pathname.includes('/page-builder');
    
    if (isInPageBuilder) {
      // Navigate within the current page builder to load the page
      const currentParams = new URLSearchParams(window.location.search);
      const organizationParam = currentParams.get('organization_id');
      const newUrl = organizationParam 
        ? `/page-builder/${pageId}?organization_id=${organizationParam}`
        : `/page-builder/${pageId}`;
      
      // Use history navigation to load the page in the current canvas
      window.history.pushState({}, '', newUrl);
      
      // Trigger a page reload to load the new page content
      window.location.reload();
    } else {
      // Open in new tab if not in page builder
      const currentDomain = window.location.origin;
      const pageEditUrl = `${currentDomain}/page-builder/${pageId}`;
      window.open(pageEditUrl, '_blank');
    }
  };

  // Create new page
  const handleCreateNewPage = () => {
    // Check if we're currently in the page builder
    const isInPageBuilder = window.location.pathname.includes('/page-builder');
    
    if (isInPageBuilder) {
      // Navigate within the current page builder to create a new page
      const currentParams = new URLSearchParams(window.location.search);
      const organizationParam = currentParams.get('organization_id');
      const newUrl = organizationParam 
        ? `/page-builder/new?organization_id=${organizationParam}`
        : `/page-builder/new`;
      
      // Use history navigation to create a new page in the current canvas
      window.history.pushState({}, '', newUrl);
      
      // Trigger a page reload to initialize the new page
      window.location.reload();
    } else {
      // Open in new tab if not in page builder
      const currentDomain = window.location.origin;
      const newPageUrl = `${currentDomain}/page-builder`;
      window.open(newPageUrl, '_blank');
    }
  };

  // Get background style
  const getBackgroundStyle = () => {
    if (backgroundType === 'gradient') {
      return {
        background: `linear-gradient(${gradientDirection}, ${gradientFrom}, ${gradientTo})`
      };
    }
    return { backgroundColor };
  };

  // Get container classes
  const getContainerClasses = () => {
    const baseClasses = "mx-auto";
    switch (maxWidth) {
      case 'full': return `${baseClasses} w-full`;
      case 'container': return `${baseClasses} container`;
      case 'lg': return `${baseClasses} max-w-4xl`;
      case 'xl': return `${baseClasses} max-w-6xl`;
      case '2xl': return `${baseClasses} max-w-7xl`;
      default: return `${baseClasses} container`;
    }
  };

  // Get visible navigation pages
  const visiblePages = pages.filter(page => page.show_in_navigation && page.published);

  // Combine pages with custom navigation items
  const allNavigationItems = [
    ...visiblePages.map(page => ({
      label: page.title,
      href: page.is_homepage ? '/' : `/${page.slug}`,
      isExternal: false
    })),
    ...customNavigationItems
  ];

  const headerStyle = {
    ...getBackgroundStyle(),
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
  };

  const LogoSection = () => (
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
  );

  const NavigationSection = () => {
    if (!showNavigation || visiblePages.length === 0) return null;

    if (navigationStyle === 'horizontal') {
      return (
        <nav className="hidden md:flex items-center space-x-6">
          {allNavigationItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              target={item.isExternal ? '_blank' : '_self'}
              className="transition-colors duration-200 hover:opacity-80"
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
            </a>
          ))}
        </nav>
      );
    }

    if (navigationStyle === 'dropdown') {
      return (
        <div className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1">
                <span>Menu</span>
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white z-50">
              {allNavigationItems.map((item, index) => (
                <DropdownMenuItem key={index} asChild>
                  <a
                    href={item.href}
                    target={item.isExternal ? '_blank' : '_self'}
                    className="w-full"
                  >
                    {item.label}
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    return null;
  };

  const SearchSection = () => {
    if (!showSearch) return null;
    
    return (
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
    );
  };

  const UserMenuSection = () => {
    if (!showUserMenu) return null;
    
    return (
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
    );
  };

  const PageManagerSection = () => {
    if (!enablePageManagement) return null;

    return (
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
    );
  };

  // Layout variations
  if (layout === 'minimal') {
    return (
      <header 
        className={`${isSticky ? 'sticky top-0 z-50' : ''} border-solid transition-all duration-300`}
        style={headerStyle}
      >
        <div className={getContainerClasses()}>
          <div className="flex items-center justify-center">
            <LogoSection />
          </div>
        </div>
      </header>
    );
  }

  if (layout === 'centered') {
    return (
      <header 
        className={`${isSticky ? 'sticky top-0 z-50' : ''} border-solid transition-all duration-300`}
        style={headerStyle}
      >
        <div className={getContainerClasses()}>
          <div className="flex flex-col items-center space-y-4">
            <LogoSection />
            <NavigationSection />
          </div>
        </div>
      </header>
    );
  }

  if (layout === 'split') {
    return (
      <header 
        className={`${isSticky ? 'sticky top-0 z-50' : ''} border-solid transition-all duration-300`}
        style={headerStyle}
      >
        <div className={getContainerClasses()}>
          <div className="flex items-center justify-between">
            <LogoSection />
            <div className="flex items-center space-x-6">
              <NavigationSection />
              <div className="flex items-center space-x-4">
                <SearchSection />
                <PageManagerSection />
                <UserMenuSection />
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Default layout
  return (
    <header 
      className={`${isSticky ? 'sticky top-0 z-50' : ''} border-solid transition-all duration-300`}
      style={headerStyle}
    >
      <div className={getContainerClasses()}>
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
          <LogoSection />
          <NavigationSection />
          
          <div className="flex items-center space-x-4">
            <SearchSection />
            <PageManagerSection />
            <UserMenuSection />
          </div>
        </div>
      </div>
    </header>
  );
};

export const headerConfig: ComponentConfig<HeaderProps> = {
  label: 'Header',
  fields: {
    // Logo Configuration
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

    // Background Configuration
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

    // Color Configuration
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

    // Layout Configuration
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

    // Behavior Configuration
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

    // Style Configuration
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

    // Typography Configuration
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
  render: (props) => {
    try {
      // Ensure props are safe before rendering
      const safeProps = {
        ...props,
        logoText: typeof props?.logoText === 'string' ? props.logoText : 'My Church',
        logoSize: typeof props?.logoSize === 'number' ? props.logoSize : 32,
        textColor: typeof props?.textColor === 'string' ? props.textColor : '#1f2937',
        backgroundColor: typeof props?.backgroundColor === 'string' ? props.backgroundColor : '#ffffff',
        showNavigation: Boolean(props?.showNavigation !== false),
        enablePageManagement: Boolean(props?.enablePageManagement !== false)
      };
      
      return <Header {...safeProps} />;
    } catch (error) {
      console.error('Header config render error:', error);
      return <div className="p-4 border border-red-300 text-red-500 text-center bg-red-50 rounded">
        Error rendering Header
      </div>;
    }
  }
};

export default Header;
