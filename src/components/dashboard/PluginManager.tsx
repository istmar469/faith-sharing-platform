
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plugin } from '@/types/plugins';
import { pluginRegistry } from '@/services/pluginRegistry';
import { Puzzle, Settings, Power, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PluginManagerProps {
  organizationId: string;
}

const PluginManager: React.FC<PluginManagerProps> = ({ organizationId }) => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [activePlugins, setActivePlugins] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = () => {
    const allPlugins = pluginRegistry.getAllPlugins();
    setPlugins(allPlugins);
    
    const active = new Set<string>();
    allPlugins.forEach(plugin => {
      if (pluginRegistry.isActive(plugin.config.id)) {
        active.add(plugin.config.id);
      }
    });
    setActivePlugins(active);
  };

  const handlePluginToggle = async (pluginId: string, isActive: boolean) => {
    setLoading(pluginId);
    
    try {
      if (isActive) {
        await pluginRegistry.activate(pluginId);
        setActivePlugins(prev => new Set([...prev, pluginId]));
        toast.success('Plugin activated successfully');
      } else {
        await pluginRegistry.deactivate(pluginId);
        setActivePlugins(prev => {
          const newSet = new Set(prev);
          newSet.delete(pluginId);
          return newSet;
        });
        toast.success('Plugin deactivated successfully');
      }
    } catch (error) {
      console.error('Plugin toggle error:', error);
      toast.error(`Failed to ${isActive ? 'activate' : 'deactivate'} plugin`);
    } finally {
      setLoading(null);
    }
  };

  const getStatusIcon = (pluginId: string) => {
    if (loading === pluginId) {
      return <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />;
    }
    return activePlugins.has(pluginId) ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <AlertCircle className="h-4 w-4 text-gray-400" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Puzzle className="h-5 w-5" />
          <CardTitle>Plugin Manager</CardTitle>
        </div>
        <CardDescription>
          Manage and configure plugins for your site
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {plugins.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Puzzle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No plugins available</p>
                <p className="text-sm">Plugins will appear here when they are registered</p>
              </div>
            ) : (
              plugins.map((plugin) => (
                <div key={plugin.config.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(plugin.config.id)}
                        <h3 className="font-semibold">{plugin.config.name}</h3>
                        <Badge variant="outline">{plugin.config.version}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {plugin.config.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {plugin.config.author}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={activePlugins.has(plugin.config.id)}
                        onCheckedChange={(checked) => handlePluginToggle(plugin.config.id, checked)}
                        disabled={loading === plugin.config.id}
                      />
                    </div>
                  </div>
                  
                  {plugin.config.dependencies && plugin.config.dependencies.length > 0 && (
                    <>
                      <Separator className="my-3" />
                      <div>
                        <p className="text-xs font-medium mb-1">Dependencies:</p>
                        <div className="flex flex-wrap gap-1">
                          {plugin.config.dependencies.map((dep) => (
                            <Badge key={dep} variant="secondary" className="text-xs">
                              {dep}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PluginManager;
