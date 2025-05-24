
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PluginManager from './PluginManager';
import { usePluginSystemContext } from './PluginSystemProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Zap, Settings } from 'lucide-react';

interface PluginDashboardProps {
  organizationId: string;
}

const PluginDashboard: React.FC<PluginDashboardProps> = ({ organizationId }) => {
  const { activePlugins, plugins, isLoading } = usePluginSystemContext();

  const stats = {
    total: plugins.length,
    active: activePlugins.length,
    available: plugins.length - activePlugins.length
  };

  return (
    <div className="space-y-6">
      {/* Plugin Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plugins</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Registered in system
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plugins</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.available}</div>
            <p className="text-xs text-muted-foreground">
              Ready to activate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plugin Management Tabs */}
      <Tabs defaultValue="manager" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manager">Plugin Manager</TabsTrigger>
          <TabsTrigger value="store">Plugin Store</TabsTrigger>
          <TabsTrigger value="developer">Developer Tools</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manager">
          <PluginManager organizationId={organizationId} />
        </TabsContent>
        
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle>Plugin Store</CardTitle>
              <CardDescription>
                Discover and install new plugins for your site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Plugin Store coming soon</p>
                <p className="text-sm">Browse and install community plugins</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="developer">
          <Card>
            <CardHeader>
              <CardTitle>Developer Tools</CardTitle>
              <CardDescription>
                Tools for plugin development and debugging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Developer tools coming soon</p>
                <p className="text-sm">Debug and develop custom plugins</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PluginDashboard;
