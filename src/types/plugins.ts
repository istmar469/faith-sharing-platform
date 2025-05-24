
// Plugin system type definitions for extensible site builder architecture

export interface PluginConfig {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  dependencies?: string[];
  permissions?: PluginPermission[];
}

export interface PluginPermission {
  type: 'database' | 'storage' | 'api' | 'ui';
  scope: string;
  actions: string[];
}

export interface PluginContext {
  organizationId: string;
  userId: string;
  supabase: any;
  eventBus: EventBus;
  state: PluginStateManager;
}

export interface PluginLifecycle {
  onLoad?(context: PluginContext): Promise<void>;
  onInitialize?(context: PluginContext): Promise<void>;
  onActivate?(context: PluginContext): Promise<void>;
  onDeactivate?(context: PluginContext): Promise<void>;
  onUnload?(context: PluginContext): Promise<void>;
}

export interface PluginComponent {
  id: string;
  type: 'sidebar' | 'modal' | 'toolbar' | 'canvas';
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export interface Plugin extends PluginLifecycle {
  config: PluginConfig;
  components?: PluginComponent[];
  hooks?: PluginHooks;
}

export interface PluginHooks {
  onPageCreate?: (pageData: any) => Promise<void>;
  onPageUpdate?: (pageData: any) => Promise<void>;
  onPageDelete?: (pageId: string) => Promise<void>;
  onSiteSettingsUpdate?: (settings: any) => Promise<void>;
}

export interface EventBus {
  emit(event: string, data?: any): void;
  on(event: string, handler: (data?: any) => void): () => void;
  off(event: string, handler: (data?: any) => void): void;
}

export interface PluginStateManager {
  get(key: string): any;
  set(key: string, value: any): void;
  delete(key: string): void;
  clear(): void;
}

export interface PluginRegistry {
  register(plugin: Plugin): Promise<void>;
  unregister(pluginId: string): Promise<void>;
  getPlugin(pluginId: string): Plugin | null;
  getAllPlugins(): Plugin[];
  isActive(pluginId: string): boolean;
  activate(pluginId: string): Promise<void>;
  deactivate(pluginId: string): Promise<void>;
}
