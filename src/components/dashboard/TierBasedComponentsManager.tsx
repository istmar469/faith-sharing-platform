
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Crown, Zap, Users, ArrowUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useOrganizationComponents } from '@/hooks/useOrganizationComponents';
import { useTenantContext } from '@/components/context/TenantContext';

const TierBasedComponentsManager: React.FC = () => {
  const { organizationId } = useTenantContext();
  const { components, loading, error, toggleComponent } = useOrganizationComponents(organizationId || '');
  const { toast } = useToast();

  const handleToggleComponent = async (componentId: string, enabled: boolean) => {
    try {
      await toggleComponent(componentId, enabled);
      toast({
        title: enabled ? 'Component Enabled' : 'Component Disabled',
        description: `${componentId.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')} has been ${enabled ? 'enabled' : 'disabled'}.`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update component',
        variant: 'destructive'
      });
    }
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
          <CardTitle>Loading Components...</CardTitle>
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Website Components</CardTitle>
          <CardDescription>
            Manage which components are active on your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {/* Enabled Components */}
            {enabledComponents.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-green-700">Active Components</h3>
                <div className="grid gap-3">
                  {enabledComponents.map((component) => (
                    <div key={component.component_id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium">
                            {component.display_name || component.component_id.split('-').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </h4>
                          <Badge variant={getTierBadgeVariant(component.minimum_tier_required)}>
                            {getTierIcon(component.minimum_tier_required)}
                            {component.minimum_tier_required}
                          </Badge>
                          <Badge variant="default">Active</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{component.description}</p>
                      </div>
                      <Switch
                        checked={true}
                        onCheckedChange={(checked) => 
                          handleToggleComponent(component.component_id, checked)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Components */}
            {availableComponents.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Available Components</h3>
                <div className="grid gap-3">
                  {availableComponents.map((component) => (
                    <div key={component.component_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium">
                            {component.display_name || component.component_id.split('-').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </h4>
                          <Badge variant={getTierBadgeVariant(component.minimum_tier_required)}>
                            {getTierIcon(component.minimum_tier_required)}
                            {component.minimum_tier_required}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{component.description}</p>
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
              <div>
                <h3 className="font-semibold mb-3 text-orange-700">Upgrade Required</h3>
                <Alert className="mb-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    These components require a higher subscription tier to use.
                  </AlertDescription>
                </Alert>
                <div className="grid gap-3">
                  {upgradeRequiredComponents.map((component) => (
                    <div key={component.component_id} className="flex items-center justify-between p-3 border rounded-lg bg-orange-50 opacity-75">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium">
                            {component.display_name || component.component_id.split('-').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </h4>
                          <Badge variant={getTierBadgeVariant(component.minimum_tier_required)}>
                            {getTierIcon(component.minimum_tier_required)}
                            {component.minimum_tier_required} Required
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{component.description}</p>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TierBasedComponentsManager;
