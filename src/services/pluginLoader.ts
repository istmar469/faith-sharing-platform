
import { Plugin } from '@/types/plugins';
import { pluginRegistry } from '@/services/pluginRegistry';

// Registry for dynamically loaded plugins
const dynamicPluginRegistry = new Map<string, () => Promise<Plugin>>();

export class PluginLoader {
  static registerPlugin(id: string, loader: () => Promise<Plugin>) {
    dynamicPluginRegistry.set(id, loader);
  }

  static async loadPlugin(id: string): Promise<Plugin | null> {
    const loader = dynamicPluginRegistry.get(id);
    if (!loader) {
      console.warn(`Plugin loader not found for id: ${id}`);
      return null;
    }

    try {
      const plugin = await loader();
      await pluginRegistry.register(plugin);
      return plugin;
    } catch (error) {
      console.error(`Failed to load plugin ${id}:`, error);
      return null;
    }
  }

  static async loadAllPlugins(): Promise<void> {
    const loadPromises = Array.from(dynamicPluginRegistry.keys()).map(id => 
      this.loadPlugin(id)
    );
    
    await Promise.allSettled(loadPromises);
  }

  static getAvailablePlugins(): string[] {
    return Array.from(dynamicPluginRegistry.keys());
  }
}

// Auto-discovery system for plugins
export const discoverAndRegisterPlugins = async () => {
  // This would typically scan a plugins directory or registry
  // For now, we'll register known plugins
  
  console.log('Plugin discovery system initialized');
  console.log('Available plugin slots:', PluginLoader.getAvailablePlugins());
};
