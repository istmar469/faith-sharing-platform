import { Plugin } from '@/types/plugins';
import { pluginRegistry } from '@/services/pluginRegistry';
import { NavigationPlugin } from '@/plugins/navigation';
import { ChurchManagementPlugin } from '@/plugins/church-management';

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
  console.log('Plugin discovery system initialized');
  
  // Register the navigation plugin
  PluginLoader.registerPlugin('navigation-manager', async () => {
    return new NavigationPlugin();
  });
  
  // Register the church management plugin
  PluginLoader.registerPlugin('church-management', async () => {
    return new ChurchManagementPlugin();
  });
  
  // Auto-load core plugins
  await PluginLoader.loadPlugin('navigation-manager');
  await PluginLoader.loadPlugin('church-management');
  
  console.log('Available plugin slots:', PluginLoader.getAvailablePlugins());
  console.log('Core plugins loaded automatically');
};
