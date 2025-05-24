
import { useState, useEffect, useCallback } from 'react';
import { Plugin, PluginComponent } from '@/types/plugins';
import { pluginRegistry } from '@/services/pluginRegistry';
import { PluginLoader } from '@/services/pluginLoader';

interface UsePluginSystemReturn {
  plugins: Plugin[];
  activePlugins: Plugin[];
  isLoading: boolean;
  error: string | null;
  activatePlugin: (pluginId: string) => Promise<void>;
  deactivatePlugin: (pluginId: string) => Promise<void>;
  getPluginComponents: (type?: string) => PluginComponent[];
  refreshPlugins: () => void;
}

export const usePluginSystem = (organizationId?: string): UsePluginSystemReturn => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [activePlugins, setActivePlugins] = useState<Plugin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPlugins = useCallback(() => {
    try {
      const allPlugins = pluginRegistry.getAllPlugins();
      const active = allPlugins.filter(plugin => 
        pluginRegistry.isActive(plugin.config.id)
      );
      
      setPlugins(allPlugins);
      setActivePlugins(active);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  useEffect(() => {
    const initializePlugins = async () => {
      setIsLoading(true);
      try {
        await PluginLoader.loadAllPlugins();
        refreshPlugins();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize plugins');
      } finally {
        setIsLoading(false);
      }
    };

    initializePlugins();
  }, [refreshPlugins]);

  const activatePlugin = useCallback(async (pluginId: string) => {
    try {
      await pluginRegistry.activate(pluginId);
      refreshPlugins();
    } catch (err) {
      throw new Error(`Failed to activate plugin: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [refreshPlugins]);

  const deactivatePlugin = useCallback(async (pluginId: string) => {
    try {
      await pluginRegistry.deactivate(pluginId);
      refreshPlugins();
    } catch (err) {
      throw new Error(`Failed to deactivate plugin: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [refreshPlugins]);

  const getPluginComponents = useCallback((type?: string): PluginComponent[] => {
    const components: PluginComponent[] = [];
    
    activePlugins.forEach(plugin => {
      if (plugin.components) {
        const filteredComponents = type 
          ? plugin.components.filter(comp => comp.type === type)
          : plugin.components;
        components.push(...filteredComponents);
      }
    });
    
    return components;
  }, [activePlugins]);

  return {
    plugins,
    activePlugins,
    isLoading,
    error,
    activatePlugin,
    deactivatePlugin,
    getPluginComponents,
    refreshPlugins
  };
};
