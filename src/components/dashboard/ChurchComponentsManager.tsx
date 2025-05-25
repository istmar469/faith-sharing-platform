
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, Settings, Eye } from 'lucide-react';
import { useChurchComponents } from '@/hooks/useChurchComponents';
import { useToast } from '@/hooks/use-toast';

const ChurchComponentsManager: React.FC = () => {
  const { 
    availableComponents, 
    enabledComponents, 
    isLoading, 
    error, 
    enableComponent, 
    disableComponent 
  } = useChurchComponents();
  const { toast } = useToast();

  const isComponentEnabled = (componentId: string) => {
    return enabledComponents.some(comp => comp.component_id === componentId && comp.enabled);
  };

  const handleToggleComponent = async (componentId: string, enabled: boolean) => {
    try {
      if (enabled) {
        await enableComponent(componentId);
        toast({
          title: "Component Enabled",
          description: `${componentId} is now available in your page builder.`
        });
      } else {
        await disableComponent(componentId);
        toast({
          title: "Component Disabled", 
          description: `${componentId} has been removed from your page builder.`
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update component status.",
        variant: "destructive"
      });
    }
  };

  const componentDescriptions: Record<string, string> = {
    ServiceTimes: "Display your church service schedule with customizable layouts",
    EventCalendar: "Show upcoming church events and activities in various formats",
    StaffDirectory: "Display church staff with photos and contact information",
    DonationForm: "Secure donation collection with Stripe integration",
    AnnouncementBoard: "Latest church announcements and important news",
    ChurchStats: "Live attendance, member count, and donation statistics",
    ContactInfo: "Church contact details with map integration",
    MissionStatement: "Church vision, mission, and values display"
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Components...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Components</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Website Components</CardTitle>
        <CardDescription>
          Manage which church components are available in your page builder
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {availableComponents.map((component) => {
            const enabled = isComponentEnabled(component.component_id);
            
            return (
              <div 
                key={component.component_id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium">{component.component_id}</h4>
                    <Badge variant={enabled ? "default" : "secondary"}>
                      {enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {componentDescriptions[component.component_id] || "Church management component"}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {enabled && (
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                  )}
                  
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => 
                      handleToggleComponent(component.component_id, checked)
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        {availableComponents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No church components available.</p>
            <p className="text-sm">Contact support to enable church management features.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChurchComponentsManager;
