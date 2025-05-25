
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Settings, Eye, Calendar, Users, MessageSquare, BarChart3, Phone, Clock, Crown, Zap, AlertCircle, ArrowUp } from 'lucide-react';
import { useOrganizationComponents } from '@/hooks/useOrganizationComponents';
import { useTenantContext } from '@/components/context/TenantContext';
import { useToast } from '@/hooks/use-toast';

const EnhancedChurchComponentsManager: React.FC = () => {
  const { organizationId } = useTenantContext();
  const { components, loading, error, toggleComponent, refetch } = useOrganizationComponents(organizationId || '');
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const handleToggleComponent = async (componentId: string, enabled: boolean) => {
    try {
      await toggleComponent(componentId, enabled);
      toast({
        title: enabled ? 'Component Enabled' : 'Component Disabled',
        description: `${getComponentDisplayName(componentId)} has been ${enabled ? 'enabled' : 'disabled'}.`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update component',
        variant: 'destructive'
      });
    }
  };

  const getComponentIcon = (componentId: string) => {
    const iconMap: Record<string, JSX.Element> = {
      'event-calendar': <Calendar className="h-5 w-5" />,
      'enhanced-event-calendar': <Calendar className="h-5 w-5" />,
      'service-times': <Clock className="h-5 w-5" />,
      'contact-info': <Phone className="h-5 w-5" />,
      'church-stats': <BarChart3 className="h-5 w-5" />,
      'staff-directory': <Users className="h-5 w-5" />,
      'announcement-board': <MessageSquare className="h-5 w-5" />
    };
    return iconMap[componentId] || <Settings className="h-5 w-5" />;
  };

  const getComponentDisplayName = (componentId: string) => {
    const nameMap: Record<string, string> = {
      'event-calendar': 'Event Calendar',
      'enhanced-event-calendar': 'Enhanced Event Calendar',
      'service-times': 'Service Times',
      'contact-info': 'Contact Info',
      'church-stats': 'Church Stats',
      'staff-directory': 'Staff Directory',
      'announcement-board': 'Announcement Board'
    };
    return nameMap[componentId] || componentId.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'basic': return <Users className="h-4 w-4" />;
      case 'premium': return <Zap className="h-4 w-4" />;
      case 'enterprise': return <Crown className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'basic': return 'secondary';
      case 'premium': return 'default';
      case 'enterprise': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
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

  const enabledComponents = components.filter(c => c.is_org_enabled);
  const availableComponents = components.filter(c => c.can_enable && !c.is_org_enabled);
  const upgradeRequiredComponents = components.filter(c => !c.is_tier_included && c.is_globally_enabled);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Church Website Components</span>
          <Badge variant="secondary">
            {enabledComponents.length} of {components.length} enabled
          </Badge>
        </CardTitle>
        <CardDescription>
          Manage which church components are available in your page builder
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Component Overview</TabsTrigger>
            <TabsTrigger value="settings">Advanced Settings</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 mt-6">
            {/* Active Components */}
            {enabledComponents.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-green-700">Active Components</h3>
                <div className="grid gap-4">
                  {enabledComponents.map((component) => (
                    <div 
                      key={component.component_id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 rounded-lg bg-green-200 text-green-700">
                          {getComponentIcon(component.component_id)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-medium">{getComponentDisplayName(component.component_id)}</h4>
                            <Badge variant={getTierBadgeVariant(component.minimum_tier_required)}>
                              {getTierIcon(component.minimum_tier_required)}
                              {component.minimum_tier_required}
                            </Badge>
                            <Badge variant="default">Active</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{component.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                        <Switch
                          checked={true}
                          onCheckedChange={(checked) => 
                            handleToggleComponent(component.component_id, checked)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Components */}
            {availableComponents.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Available Components</h3>
                <div className="grid gap-4">
                  {availableComponents.map((component) => (
                    <div 
                      key={component.component_id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                          {getComponentIcon(component.component_id)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-medium">{getComponentDisplayName(component.component_id)}</h4>
                            <Badge variant={getTierBadgeVariant(component.minimum_tier_required)}>
                              {getTierIcon(component.minimum_tier_required)}
                              {component.minimum_tier_required}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{component.description}</p>
                        </div>
                      </div>
                      
                      <Switch
                        checked={false}
                        onCheckedChange={(checked) => 
                          handleToggleComponent(component.component_id, checked)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upgrade Required Components */}
            {upgradeRequiredComponents.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-orange-700">Upgrade Required</h3>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    These components require a higher subscription tier to use.
                  </AlertDescription>
                </Alert>
                <div className="grid gap-4">
                  {upgradeRequiredComponents.map((component) => (
                    <div 
                      key={component.component_id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-orange-50 opacity-75"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 rounded-lg bg-orange-200 text-orange-700">
                          {getComponentIcon(component.component_id)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-medium">{getComponentDisplayName(component.component_id)}</h4>
                            <Badge variant={getTierBadgeVariant(component.minimum_tier_required)}>
                              {getTierIcon(component.minimum_tier_required)}
                              {component.minimum_tier_required} Required
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{component.description}</p>
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm">
                        <ArrowUp className="h-4 w-4 mr-1" />
                        Upgrade
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Component Dependencies</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Some components require others to function properly.
                </p>
                <div className="text-sm">
                  <Badge variant="outline" className="mr-2">Enhanced Event Calendar</Badge>
                  requires event management dashboard
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Quick Actions</h4>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      availableComponents.forEach(comp => 
                        handleToggleComponent(comp.component_id, true)
                      );
                    }}
                    disabled={availableComponents.length === 0}
                  >
                    Enable All Available
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      enabledComponents.forEach(comp => 
                        handleToggleComponent(comp.component_id, false)
                      );
                    }}
                    disabled={enabledComponents.length === 0}
                  >
                    Disable All
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Current Subscription</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Your current subscription determines which components you can use.
                </p>
                {upgradeRequiredComponents.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Upgrade your subscription to unlock {upgradeRequiredComponents.length} additional components.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedChurchComponentsManager;
