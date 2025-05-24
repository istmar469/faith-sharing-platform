
import React from 'react';
import { useTenantContext } from '@/components/context/TenantContext';
import { usePluginSystemContext } from '@/components/dashboard/PluginSystemProvider';
import NavigationEditor from '@/plugins/navigation/components/NavigationEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const NavigationSidebar: React.FC = () => {
  const { organizationId } = useTenantContext();
  const { plugins, isLoading, error } = usePluginSystemContext();
  
  // Find the navigation plugin
  const navigationPlugin = plugins.find(plugin => plugin.config.id === 'navigation-manager');
  
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Plugin system error: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!navigationPlugin) {
    return (
      <div className="p-4">
        <Alert>
          <Navigation className="h-4 w-4" />
          <AlertDescription>
            Navigation plugin is not available. The plugin may not be loaded properly.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!organizationId) {
    return (
      <div className="p-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Organization context is required for navigation management.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="h-full overflow-auto">
      <NavigationEditor organizationId={organizationId} />
    </div>
  );
};

export default NavigationSidebar;
