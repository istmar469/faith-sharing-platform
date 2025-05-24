
import { Plugin, PluginContext, PluginComponent } from '@/types/plugins';
import NavigationEditor from './components/NavigationEditor';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  children?: NavigationItem[];
  isExternal?: boolean;
  order: number;
}

export interface NavigationSettings {
  items: NavigationItem[];
  style: 'horizontal' | 'vertical';
  mobileBreakpoint: number;
  showLogo: boolean;
  logoText?: string;
  logoImage?: string;
}

export class NavigationPlugin implements Plugin {
  config = {
    id: 'navigation-manager',
    name: 'Navigation Manager',
    version: '1.0.0',
    description: 'Drag-and-drop navigation builder with auto-discovery',
    author: 'Site Builder Team',
    permissions: [
      {
        type: 'database' as const,
        scope: 'pages',
        actions: ['read']
      },
      {
        type: 'storage' as const,
        scope: 'navigation',
        actions: ['read', 'write']
      }
    ]
  };

  components: PluginComponent[] = [
    {
      id: 'navigation-editor',
      type: 'sidebar',
      component: NavigationEditor,
      position: 'left'
    }
  ];

  private context?: PluginContext;

  async onLoad(context: PluginContext): Promise<void> {
    this.context = context;
    console.log('Navigation plugin loaded');
  }

  async onInitialize(context: PluginContext): Promise<void> {
    // Initialize default navigation settings
    const existingNav = context.state.get('navigation-settings');
    if (!existingNav) {
      const defaultSettings: NavigationSettings = {
        items: [],
        style: 'horizontal',
        mobileBreakpoint: 768,
        showLogo: true,
        logoText: 'My Site'
      };
      context.state.set('navigation-settings', defaultSettings);
    }
    console.log('Navigation plugin initialized');
  }

  async onActivate(context: PluginContext): Promise<void> {
    // Start auto-discovery
    await this.discoverPages(context);
    
    // Listen for page events
    context.eventBus.on('page:created', this.handlePageCreated.bind(this));
    context.eventBus.on('page:deleted', this.handlePageDeleted.bind(this));
    context.eventBus.on('page:updated', this.handlePageUpdated.bind(this));
    
    console.log('Navigation plugin activated');
  }

  async onDeactivate(context: PluginContext): Promise<void> {
    // Clean up event listeners
    context.eventBus.off('page:created', this.handlePageCreated.bind(this));
    context.eventBus.off('page:deleted', this.handlePageDeleted.bind(this));
    context.eventBus.off('page:updated', this.handlePageUpdated.bind(this));
    
    console.log('Navigation plugin deactivated');
  }

  private async discoverPages(context: PluginContext): Promise<void> {
    try {
      // Query pages from Supabase
      const { data: pages, error } = await context.supabase
        .from('pages')
        .select('id, title, slug, is_homepage')
        .eq('organization_id', context.organizationId);

      if (error) {
        console.error('Failed to discover pages:', error);
        return;
      }

      const currentSettings: NavigationSettings = context.state.get('navigation-settings') || {
        items: [],
        style: 'horizontal',
        mobileBreakpoint: 768,
        showLogo: true,
        logoText: 'My Site'
      };

      // Auto-generate navigation items for new pages
      const existingPaths = currentSettings.items.map(item => item.path);
      let maxOrder = Math.max(...currentSettings.items.map(item => item.order), 0);

      pages?.forEach(page => {
        const path = page.is_homepage ? '/' : `/${page.slug}`;
        if (!existingPaths.includes(path)) {
          const newItem: NavigationItem = {
            id: page.id,
            label: page.title,
            path,
            order: ++maxOrder
          };
          currentSettings.items.push(newItem);
        }
      });

      // Sort by order
      currentSettings.items.sort((a, b) => a.order - b.order);
      
      context.state.set('navigation-settings', currentSettings);
      console.log('Pages discovered and navigation updated');
    } catch (error) {
      console.error('Error during page discovery:', error);
    }
  }

  private handlePageCreated = async (data: any) => {
    if (!this.context) return;
    
    const settings: NavigationSettings = this.context.state.get('navigation-settings');
    const maxOrder = Math.max(...settings.items.map(item => item.order), 0);
    
    const newItem: NavigationItem = {
      id: data.id,
      label: data.title,
      path: data.is_homepage ? '/' : `/${data.slug}`,
      order: maxOrder + 1
    };
    
    settings.items.push(newItem);
    this.context.state.set('navigation-settings', settings);
    
    console.log('Navigation updated for new page:', data.title);
  };

  private handlePageDeleted = async (data: any) => {
    if (!this.context) return;
    
    const settings: NavigationSettings = this.context.state.get('navigation-settings');
    settings.items = settings.items.filter(item => item.id !== data.pageId);
    this.context.state.set('navigation-settings', settings);
    
    console.log('Navigation updated for deleted page');
  };

  private handlePageUpdated = async (data: any) => {
    if (!this.context) return;
    
    const settings: NavigationSettings = this.context.state.get('navigation-settings');
    const item = settings.items.find(item => item.id === data.id);
    
    if (item) {
      item.label = data.title;
      item.path = data.is_homepage ? '/' : `/${data.slug}`;
      this.context.state.set('navigation-settings', settings);
    }
    
    console.log('Navigation updated for modified page:', data.title);
  };
}
