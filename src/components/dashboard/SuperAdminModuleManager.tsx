
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Globe, Users, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SuperAdminComponent {
  id: string;
  component_id: string;
  is_globally_enabled: boolean;
  minimum_tier_required: string;
  description: string;
  category: string;
}

const SuperAdminModuleManager: React.FC = () => {
  const [components, setComponents] = useState<SuperAdminComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      const { data, error } = await supabase
        .from('super_admin_component_control')
        .select('*')
        .order('category, component_id');

      if (error) throw error;
      setComponents(data || []);
    } catch (error) {
      console.error('Error fetching components:', error);
      toast({
        title: 'Error',
        description: 'Failed to load components',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateComponentControl = async (
    componentId: string, 
    updates: Partial<SuperAdminComponent>
  ) => {
    try {
      const { error } = await supabase
        .from('super_admin_component_control')
        .update(updates)
        .eq('component_id', componentId);

      if (error) throw error;

      await fetchComponents();
      toast({
        title: 'Success',
        description: 'Component settings updated',
      });
    } catch (error) {
      console.error('Error updating component:', error);
      toast({
        title: 'Error',
        description: 'Failed to update component',
        variant: 'destructive'
      });
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'church': return <Users className="h-4 w-4" />;
      case 'analytics': return <BarChart3 className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Module Manager...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const groupedComponents = components.reduce((acc, component) => {
    if (!acc[component.category]) {
      acc[component.category] = [];
    }
    acc[component.category].push(component);
    return acc;
  }, {} as Record<string, SuperAdminComponent[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Platform Module Manager
        </CardTitle>
        <CardDescription>
          Control which modules are available across the platform and set tier requirements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="components" className="space-y-4">
          <TabsList>
            <TabsTrigger value="components">Module Controls</TabsTrigger>
            <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="components" className="space-y-4">
            {Object.entries(groupedComponents).map(([category, categoryComponents]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2 capitalize">
                  {getCategoryIcon(category)}
                  {category} Components
                </h3>
                
                <div className="grid gap-3">
                  {categoryComponents.map((component) => (
                    <div 
                      key={component.component_id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">
                            {component.component_id.split('-').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </h4>
                          <Badge variant={getTierBadgeVariant(component.minimum_tier_required)}>
                            {component.minimum_tier_required}
                          </Badge>
                          <Badge variant={component.is_globally_enabled ? "default" : "secondary"}>
                            {component.is_globally_enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{component.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-xs text-gray-500">Minimum Tier</label>
                          <Select
                            value={component.minimum_tier_required}
                            onValueChange={(value) => 
                              updateComponentControl(component.component_id, { 
                                minimum_tier_required: value 
                              })
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex flex-col gap-2 items-center">
                          <label className="text-xs text-gray-500">Platform Enabled</label>
                          <Switch
                            checked={component.is_globally_enabled}
                            onCheckedChange={(checked) => 
                              updateComponentControl(component.component_id, { 
                                is_globally_enabled: checked 
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Module usage analytics will be available here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SuperAdminModuleManager;
