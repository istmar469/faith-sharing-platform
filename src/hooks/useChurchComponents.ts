
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/components/context/TenantContext';

interface ComponentPermission {
  component_id: string;
  display_name?: string;
  description?: string;
  enabled: boolean;
  configuration: Record<string, any>;
  category?: string;
  dependencies?: string[];
}

interface UseChurchComponentsReturn {
  availableComponents: ComponentPermission[];
  enabledComponents: ComponentPermission[];
  isLoading: boolean;
  error: string | null;
  enableComponent: (componentId: string, config?: Record<string, any>) => Promise<void>;
  disableComponent: (componentId: string) => Promise<void>;
  updateComponentConfig: (componentId: string, config: Record<string, any>) => Promise<void>;
  refreshComponents: () => void;
}

export const useChurchComponents = (): UseChurchComponentsReturn => {
  const { organizationId } = useTenantContext();
  const [availableComponents, setAvailableComponents] = useState<ComponentPermission[]>([]);
  const [enabledComponents, setEnabledComponents] = useState<ComponentPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComponents = async () => {
    if (!organizationId) return;

    try {
      setIsLoading(true);
      
      // Get church components using the new database function
      const { data: churchData, error: churchError } = await supabase
        .rpc('get_enabled_church_components', { org_id: organizationId });

      if (churchError) throw churchError;

      // Get all component permissions for this organization
      const { data: allData, error: allError } = await supabase
        .from('component_permissions')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('category', 'church');

      if (allError) throw allError;

      // Get enabled components
      const { data: enabledData, error: enabledError } = await supabase
        .from('enabled_components')
        .select('component_id, configuration, is_active')
        .eq('organization_id', organizationId)
        .eq('is_active', true);

      if (enabledError) throw enabledError;

      // Transform the data to match our interface
      const transformedAvailable = (allData || []).map((item) => ({
        component_id: item.component_id,
        display_name: item.display_name,
        description: item.description,
        enabled: item.enabled,
        configuration: {},
        category: item.category,
        dependencies: item.dependencies || []
      }));

      const transformedEnabled = (enabledData || [])
        .filter(item => transformedAvailable.some(comp => comp.component_id === item.component_id))
        .map(item => {
          const availableItem = transformedAvailable.find(comp => comp.component_id === item.component_id);
          return {
            component_id: item.component_id,
            display_name: availableItem?.display_name,
            description: availableItem?.description,
            enabled: item.is_active,
            configuration: typeof item.configuration === 'object' && item.configuration !== null
              ? item.configuration as Record<string, any>
              : {},
            category: availableItem?.category,
            dependencies: availableItem?.dependencies || []
          };
        });

      setAvailableComponents(transformedAvailable);
      setEnabledComponents(transformedEnabled);
      setError(null);
    } catch (err) {
      console.error('Error fetching components:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchComponents();
    }
  }, [organizationId]);

  const enableComponent = async (componentId: string, config: Record<string, any> = {}) => {
    if (!organizationId) return;

    try {
      const { error } = await supabase
        .from('enabled_components')
        .upsert({
          organization_id: organizationId,
          component_id: componentId,
          configuration: config,
          is_active: true
        });

      if (error) throw error;
      await fetchComponents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable component');
      throw err;
    }
  };

  const disableComponent = async (componentId: string) => {
    if (!organizationId) return;

    try {
      const { error } = await supabase
        .from('enabled_components')
        .update({ is_active: false })
        .eq('organization_id', organizationId)
        .eq('component_id', componentId);

      if (error) throw error;
      await fetchComponents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable component');
      throw err;
    }
  };

  const updateComponentConfig = async (componentId: string, config: Record<string, any>) => {
    if (!organizationId) return;

    try {
      const { error } = await supabase
        .from('enabled_components')
        .update({ configuration: config })
        .eq('organization_id', organizationId)
        .eq('component_id', componentId);

      if (error) throw error;
      await fetchComponents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update component configuration');
      throw err;
    }
  };

  const refreshComponents = () => {
    fetchComponents();
  };

  return {
    availableComponents,
    enabledComponents,
    isLoading,
    error,
    enableComponent,
    disableComponent,
    updateComponentConfig,
    refreshComponents
  };
};
