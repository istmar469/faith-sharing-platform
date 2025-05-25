
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Settings, Eye, Calendar, Users, MessageSquare, BarChart3, Phone, Clock } from 'lucide-react';
import { useChurchComponents } from '@/hooks/useChurchComponents';
import { useToast } from '@/hooks/use-toast';

const EnhancedChurchComponentsManager: React.FC = () => {
  const { 
    availableComponents, 
    enabledComponents, 
    isLoading, 
    error, 
    enableComponent, 
    disableComponent 
  } = useChurchComponents();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const isComponentEnabled = (componentId: string) => {
    return enabledComponents.some(comp => comp.component_id === componentId && comp.enabled);
  };

  const handleToggleComponent = async (componentId: string, enabled: boolean) => {
    try {
      if (enabled) {
        await enableComponent(componentId);
        toast({
          title: "Component Enabled",
          description: `${getComponentDisplayName(componentId)} is now available in your page builder.`
        });
      } else {
        await disableComponent(componentId);
        toast({
          title: "Component Disabled", 
          description: `${getComponentDisplayName(componentId)} has been removed from your page builder.`
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

  const getComponentIcon = (componentId: string) => {
    const iconMap: Record<string, JSX.Element> = {
      'event-calendar': <Calendar className="h-5 w-5" />,
      'service-times': <Clock className="h-5 w-5" />,
      'contact-info': <Phone className="h-5 w-5" />,
      'church-stats': <BarChart3 className="h-5 w-5" />,
      'staff-directory': <Users className="h-5 w-5" />,
      'announcement-board': <MessageSquare className="h-5 w-5" />
    };
    return iconMap[componentId] || <Settings className="h-5 w-5" />;
  };

  const getComponentDisplayName = (componentId: string) => {
    const component = availableComponents.find(c => c.component_id === componentId);
    return component?.component_id.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') || componentId;
  };

  const getComponentDescription = (componentId: string) => {
    const descriptions: Record<string, string> = {
      'event-calendar': 'Display upcoming church events in an interactive calendar format',
      'service-times': 'Show church service schedules with customizable layouts',
      'contact-info': 'Display church contact details, address, and map integration',
      'church-stats': 'Show live attendance, member count, and donation statistics',
      'staff-directory': 'Display church staff with photos and contact information',
      'announcement-board': 'Latest church announcements and important notices'
    };
    return descriptions[componentId] || 'Church management component';
  };

  const churchComponents = availableComponents.filter(comp => 
    ['event-calendar', 'service-times', 'contact-info', 'church-stats', 'staff-directory', 'announcement-board']
    .includes(comp.component_id)
  );

  const enabledCount = churchComponents.filter(comp => isComponentEnabled(comp.component_id)).length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Church Components...
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
        <CardTitle className="flex items-center justify-between">
          <span>Church Website Components</span>
          <Badge variant="secondary">
            {enabledCount} of {churchComponents.length} enabled
          </Badge>
        </CardTitle>
        <CardDescription>
          Manage which church components are available in your page builder
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Component Overview</TabsTrigger>
            <TabsTrigger value="settings">Advanced Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {churchComponents.map((component) => {
                const enabled = isComponentEnabled(component.component_id);
                
                return (
                  <div 
                    key={component.component_id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${enabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                        {getComponentIcon(component.component_id)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium">{getComponentDisplayName(component.component_id)}</h4>
                          <Badge variant={enabled ? "default" : "secondary"}>
                            {enabled ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {getComponentDescription(component.component_id)}
                        </p>
                      </div>
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
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Component Dependencies</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Some components require others to function properly.
                </p>
                <div className="text-sm">
                  <Badge variant="outline" className="mr-2">Event Calendar</Badge>
                  requires event management dashboard
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Bulk Actions</h4>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      churchComponents.forEach(comp => 
                        handleToggleComponent(comp.component_id, true)
                      );
                    }}
                  >
                    Enable All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      churchComponents.forEach(comp => 
                        handleToggleComponent(comp.component_id, false)
                      );
                    }}
                  >
                    Disable All
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedChurchComponentsManager;
