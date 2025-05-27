
import { Plugin, PluginRegistry, PluginContext, EventBus, PluginStateManager } from '@/types/plugins';
import { supabase } from '@/integrations/supabase/client';

class SimpleEventBus implements EventBus {
  private listeners: Map<string, ((data?: any) => void)[]> = new Map();

  emit(event: string, data?: any): void {
    const handlers = this.listeners.get(event) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  on(event: string, handler: (data?: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler);

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  off(event: string, handler: (data?: any) => void): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
}

class SimpleStateManager implements PluginStateManager {
  private state: Map<string, any> = new Map();

  get(key: string): any {
    return this.state.get(key);
  }

  set(key: string, value: any): void {
    this.state.set(key, value);
  }

  delete(key: string): void {
    this.state.delete(key);
  }

  clear(): void {
    this.state.clear();
  }
}

// New OrgScopedPluginStateManager class
class OrgScopedPluginStateManager implements PluginStateManager {
  private globalStateManager: PluginStateManager;
  private organizationId: string;

  constructor(globalStateManager: PluginStateManager, organizationId: string) {
    this.globalStateManager = globalStateManager;
    this.organizationId = organizationId;
  }

  private scopeKey(key: string): string {
    return `${this.organizationId}_${key}`;
  }

  get(key: string): any {
    return this.globalStateManager.get(this.scopeKey(key));
  }

  set(key: string, value: any): void {
    this.globalStateManager.set(this.scopeKey(key), value);
  }

  delete(key: string): void {
    this.globalStateManager.delete(this.scopeKey(key));
  }

  clear(): void {
    // Clearing only organization-specific keys from a global store without iterating all keys is complex.
    // This can be a no-op, or log a warning.
    // Individual key deletion by plugins via delete() is preferred for org-scoped state.
    console.warn(`OrgScopedPluginStateManager: clear() was called for organization ${this.organizationId}. This is a no-op or has limited effect on the global state. Ensure plugins delete specific keys.`);
    // Optionally, if there's a known pattern of keys, one could attempt to clear them,
    // but this is risky and could affect other organizations if not perfectly implemented.
    // For now, it's safer to make it a no-op or a warning.
  }
}


class PluginRegistryImpl implements PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();
  private activePlugins: Set<string> = new Set();
  private eventBus: EventBus = new SimpleEventBus();
  private globalStateManager: PluginStateManager = new SimpleStateManager(); // Renamed for clarity

  async register(plugin: Plugin): Promise<void> {
    console.log(`Registering plugin: ${plugin.config.name}`);
    
    // Validate plugin config
    if (!plugin.config.id || !plugin.config.name) {
      throw new Error('Plugin must have id and name');
    }

    // Check for conflicts
    if (this.plugins.has(plugin.config.id)) {
      throw new Error(`Plugin ${plugin.config.id} is already registered`);
    }

    this.plugins.set(plugin.config.id, plugin);
    console.log(`Plugin ${plugin.config.name} registered successfully`);
  }

  async unregister(pluginId: string): Promise<void> {
    if (this.isActive(pluginId)) {
      await this.deactivate(pluginId);
    }
    this.plugins.delete(pluginId);
    console.log(`Plugin ${pluginId} unregistered`);
  }

  getPlugin(pluginId: string): Plugin | null {
    return this.plugins.get(pluginId) || null;
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  isActive(pluginId: string): boolean {
    return this.activePlugins.has(pluginId);
  }

  async activate(pluginId: string, organizationId: string, userId?: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (this.isActive(pluginId)) {
      console.log(`Plugin ${pluginId} is already active`);
      return;
    }

    const context: PluginContext = {
      organizationId: organizationId,
      userId: userId || '', // Use provided userId or default to empty string
      supabase,
      eventBus: this.eventBus,
      state: new OrgScopedPluginStateManager(this.globalStateManager, organizationId) // Use scoped manager
    };

    try {
      if (plugin.onLoad) await plugin.onLoad(context);
      if (plugin.onInitialize) await plugin.onInitialize(context);
      if (plugin.onActivate) await plugin.onActivate(context);
      
      this.activePlugins.add(pluginId);
      this.eventBus.emit('plugin:activated', { pluginId, plugin, organizationId, userId });
      console.log(`Plugin ${plugin.config.name} activated for org ${organizationId}`);
    } catch (error) {
      console.error(`Error activating plugin ${pluginId}:`, error);
      throw error;
    }
  }

  async deactivate(pluginId: string, organizationId: string, userId?: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (!this.isActive(pluginId)) {
      console.log(`Plugin ${pluginId} is not active`);
      return;
    }

    const context: PluginContext = {
      organizationId: organizationId,
      userId: userId || '', // Use provided userId or default to empty string
      supabase,
      eventBus: this.eventBus,
      state: new OrgScopedPluginStateManager(this.globalStateManager, organizationId) // Use scoped manager
    };

    try {
      if (plugin.onDeactivate) await plugin.onDeactivate(context);
      if (plugin.onUnload) await plugin.onUnload(context);
      
      this.activePlugins.delete(pluginId);
      this.eventBus.emit('plugin:deactivated', { pluginId, plugin, organizationId, userId });
      console.log(`Plugin ${plugin.config.name} deactivated for org ${organizationId}`);
    } catch (error) {
      console.error(`Error deactivating plugin ${pluginId}:`, error);
      throw error;
    }
  }

  getEventBus(): EventBus {
    return this.eventBus;
  }

  getStateManager(): PluginStateManager { // This now returns the global state manager
    return this.globalStateManager;
  }
}

// Global plugin registry instance
export const pluginRegistry = new PluginRegistryImpl();
