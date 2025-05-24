
import React from 'react';
import { usePluginSystemContext } from '@/components/dashboard/PluginSystemProvider';
import NavigationEditor from '@/plugins/navigation/components/NavigationEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from 'lucide-react';

interface NavigationPanelProps {
  organizationId?: string;
}

const NavigationPanel: React.FC<NavigationPanelProps> = ({ organizationId }) => {
  const { plugins, isLoading, error } = usePluginSystemContext();
  
  // Find the navigation plugin
  const navigationPlugin = plugins.find(plugin => plugin.config.id === 'navigation-manager');
  
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Plugin Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!navigationPlugin) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              <CardTitle>Navigation Plugin</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Navigation plugin is not available. Please check the plugin system configuration.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!organizationId) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Organization context required for navigation management.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="h-full">
      <NavigationEditor organizationId={organizationId} />
    </div>
  );
};

export default NavigationPanel;
