
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

class PluginRegistryImpl implements PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();
  private activePlugins: Set<string> = new Set();
  private eventBus: EventBus = new SimpleEventBus();
  private stateManager: PluginStateManager = new SimpleStateManager();

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

  async activate(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (this.isActive(pluginId)) {
      console.log(`Plugin ${pluginId} is already active`);
      return;
    }

    const context: PluginContext = {
      organizationId: '', // Will be set by the caller
      userId: '', // Will be set by the caller
      supabase,
      eventBus: this.eventBus,
      state: this.stateManager
    };

    try {
      if (plugin.onLoad) await plugin.onLoad(context);
      if (plugin.onInitialize) await plugin.onInitialize(context);
      if (plugin.onActivate) await plugin.onActivate(context);
      
      this.activePlugins.add(pluginId);
      this.eventBus.emit('plugin:activated', { pluginId, plugin });
      console.log(`Plugin ${plugin.config.name} activated`);
    } catch (error) {
      console.error(`Error activating plugin ${pluginId}:`, error);
      throw error;
    }
  }

  async deactivate(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (!this.isActive(pluginId)) {
      console.log(`Plugin ${pluginId} is not active`);
      return;
    }

    const context: PluginContext = {
      organizationId: '',
      userId: '',
      supabase,
      eventBus: this.eventBus,
      state: this.stateManager
    };

    try {
      if (plugin.onDeactivate) await plugin.onDeactivate(context);
      if (plugin.onUnload) await plugin.onUnload(context);
      
      this.activePlugins.delete(pluginId);
      this.eventBus.emit('plugin:deactivated', { pluginId, plugin });
      console.log(`Plugin ${plugin.config.name} deactivated`);
    } catch (error) {
      console.error(`Error deactivating plugin ${pluginId}:`, error);
      throw error;
    }
  }

  getEventBus(): EventBus {
    return this.eventBus;
  }

  getStateManager(): PluginStateManager {
    return this.stateManager;
  }
}

// Global plugin registry instance
export const pluginRegistry = new PluginRegistryImpl();
