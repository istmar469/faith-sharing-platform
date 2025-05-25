
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OrganizationComponent {
  component_id: string;
  display_name: string;
  description: string;
  category: string;
  is_globally_enabled: boolean;
  minimum_tier_required: string;
  is_tier_included: boolean;
  is_org_enabled: boolean;
  can_enable: boolean;
}

export const useOrganizationComponents = (organizationId: string) => {
  const [components, setComponents] = useState<OrganizationComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComponents = async () => {
    if (!organizationId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_organization_available_components', { org_id: organizationId });

      if (error) throw error;

      setComponents(data || []);
    } catch (err) {
      console.error('Error fetching organization components:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch components');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, [organizationId]);

  const toggleComponent = async (componentId: string, enabled: boolean) => {
    try {
      if (enabled) {
        // Check if component can be enabled
        const { data: canEnable, error: checkError } = await supabase
          .rpc('can_organization_enable_component', { 
            org_id: organizationId, 
            comp_id: componentId 
          });

        if (checkError) throw checkError;

        if (!canEnable) {
          throw new Error('Component cannot be enabled. Check subscription tier.');
        }

        // Enable component
        const { error } = await supabase
          .from('enabled_components')
          .upsert({
            organization_id: organizationId,
            component_id: componentId,
            is_active: true
          });

        if (error) throw error;
      } else {
        // Disable component
        const { error } = await supabase
          .from('enabled_components')
          .update({ is_active: false })
          .eq('organization_id', organizationId)
          .eq('component_id', componentId);

        if (error) throw error;
      }

      // Refresh components
      await fetchComponents();
    } catch (err) {
      console.error('Error toggling component:', err);
      throw err;
    }
  };

  return { 
    components, 
    loading, 
    error, 
    refetch: fetchComponents,
    toggleComponent 
  };
};
