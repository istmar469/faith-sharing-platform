
import React, { createContext, useContext, ReactNode } from 'react';
import { usePluginSystem } from '@/hooks/usePluginSystem';
import { Plugin, PluginComponent } from '@/types/plugins';

interface PluginSystemContextType {
  plugins: Plugin[];
  activePlugins: Plugin[];
  isLoading: boolean;
  error: string | null;
  activatePlugin: (pluginId: string) => Promise<void>;
  deactivatePlugin: (pluginId: string) => Promise<void>;
  getPluginComponents: (type?: string) => PluginComponent[];
  refreshPlugins: () => void;
}

const PluginSystemContext = createContext<PluginSystemContextType | null>(null);

interface PluginSystemProviderProps {
  children: ReactNode;
  organizationId?: string;
}

export const PluginSystemProvider: React.FC<PluginSystemProviderProps> = ({ 
  children, 
  organizationId 
}) => {
  const pluginSystem = usePluginSystem(organizationId);

  return (
    <PluginSystemContext.Provider value={pluginSystem}>
      {children}
    </PluginSystemContext.Provider>
  );
};

export const usePluginSystemContext = (): PluginSystemContextType => {
  const context = useContext(PluginSystemContext);
  if (!context) {
    throw new Error('usePluginSystemContext must be used within a PluginSystemProvider');
  }
  return context;
};
