
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/components/context/TenantContext';

interface ComponentPermission {
  component_id: string;
  enabled: boolean;
  configuration: Record<string, any>;
}

interface UseChurchComponentsReturn {
  availableComponents: ComponentPermission[];
  enabledComponents: ComponentPermission[];
  isLoading: boolean;
  error: string | null;
  enableComponent: (componentId: string, config?: Record<string, any>) => Promise<void>;
  disableComponent: (componentId: string) => Promise<void>;
  updateComponentConfig: (componentId: string, config: Record<string, any>) => Promise<void>;
}

export const useChurchComponents = (): UseChurchComponentsReturn => {
  const { organizationId } = useTenantContext();
  const [availableComponents, setAvailableComponents] = useState<ComponentPermission[]>([]);
  const [enabledComponents, setEnabledComponents] = useState<ComponentPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) return;

    fetchComponents();
  }, [organizationId]);

  const fetchComponents = async () => {
    if (!organizationId) return;

    try {
      setIsLoading(true);
      
      // Get available components for this organization
      const { data: availableData, error: availableError } = await supabase
        .rpc('get_available_components', { org_id: organizationId });

      if (availableError) throw availableError;

      // Get enabled components
      const { data: enabledData, error: enabledError } = await supabase
        .from('enabled_components')
        .select('component_id, configuration, is_active')
        .eq('organization_id', organizationId)
        .eq('is_active', true);

      if (enabledError) throw enabledError;

      setAvailableComponents(availableData || []);
      setEnabledComponents(enabledData?.map(item => ({
        component_id: item.component_id,
        enabled: item.is_active,
        configuration: item.configuration || {}
      })) || []);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

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
    }
  };

  return {
    availableComponents,
    enabledComponents,
    isLoading,
    error,
    enableComponent,
    disableComponent,
    updateComponentConfig
  };
};
