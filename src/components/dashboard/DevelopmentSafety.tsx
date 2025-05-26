
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { pluginSafetyManager } from '@/services/pluginSafetyManager';
import { usePluginSystem } from '@/hooks/usePluginSystem';

const DevelopmentSafety: React.FC = () => {
  const { plugins } = usePluginSystem();
  const [healthReport, setHealthReport] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshHealthChecks = async () => {
    setIsRefreshing(true);
    try {
      for (const plugin of plugins) {
        await pluginSafetyManager.checkPluginHealth(plugin.config.id);
      }
      setHealthReport(pluginSafetyManager.getHealthReport());
    } catch (error) {
      console.error('Failed to refresh health checks:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshHealthChecks();
  }, [plugins]);

  const getStatusIcon = (isHealthy: boolean) => {
    return isHealthy ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (isHealthy: boolean, errorCount: number) => {
    if (isHealthy) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Healthy</Badge>;
    }
    return <Badge variant="destructive">Errors: {errorCount}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Development Safety Dashboard</h2>
        <Button 
          onClick={refreshHealthChecks} 
          disabled={isRefreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Plugin Health Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {healthReport.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No plugin health data available. Click refresh to check plugin status.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {healthReport.map((status) => (
                  <div key={status.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(status.isHealthy)}
                      <div>
                        <p className="font-medium">{status.id}</p>
                        <p className="text-sm text-gray-500">
                          Last check: {new Date(status.lastCheck).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(status.isHealthy, status.errorCount)}
                      <div className="text-sm text-gray-500">
                        Load: {status.performanceMetrics.loadTime.toFixed(2)}ms
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plugin Safety Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Error boundary isolation enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Automatic recovery mechanisms active</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Performance monitoring enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Plugin validation on load</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DevelopmentSafety;
