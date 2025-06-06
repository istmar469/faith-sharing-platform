
import React, { useMemo } from 'react';
import { Puck } from '@measured/puck';
import { puckConfig } from './puck/config/PuckConfig';
import { createEnhancedPuckOverrides } from './puck/config/EnhancedPuckOverrides';
import { useTenantContext } from '@/components/context/TenantContext';
import { useSubscriptionTiers } from '@/hooks/useSubscriptionTiers';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface TierBasedPuckEditorProps {
  data: any;
  onSave: (data: any) => void;
  headerProps?: any;
}

const TierBasedPuckEditor: React.FC<TierBasedPuckEditorProps> = ({
  data,
  onSave,
  headerProps = {}
}) => {
  const { organizationId, organizationName, subdomain } = useTenantContext();

  // Get organization's current tier and available components
  const { data: orgTier } = useQuery({
    queryKey: ['organization-tier', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      
      const { data, error } = await supabase
        .from('organizations')
        .select('current_tier')
        .eq('id', organizationId)
        .single();
        
      if (error) throw error;
      return data.current_tier;
    },
    enabled: !!organizationId
  });

  const { data: availableComponents } = useQuery({
    queryKey: ['tier-components', organizationId, orgTier],
    queryFn: async () => {
      if (!organizationId) return [];
      
      const { data, error } = await supabase
        .from('tier_component_permissions')
        .select(`
          component_id,
          is_included,
          tier_id,
          subscription_tiers!inner(name)
        `)
        .eq('subscription_tiers.name', orgTier || 'basic')
        .eq('is_included', true);
        
      if (error) throw error;
      return data.map(item => item.component_id);
    },
    enabled: !!organizationId && !!orgTier
  });

  // Create filtered config based on tier
  const filteredConfig = useMemo(() => {
    if (!availableComponents) return puckConfig;
    
    // Filter components based on tier permissions
    const filteredComponents: any = {};
    
    Object.entries(puckConfig.components).forEach(([key, component]) => {
      if (availableComponents.includes(key)) {
        filteredComponents[key] = component;
      }
    });
    
    return {
      ...puckConfig,
      components: filteredComponents
    };
  }, [availableComponents]);

  const puckOverrides = useMemo(() => 
    createEnhancedPuckOverrides({
      organizationName: organizationName || 'Your Organization',
      organizationId: organizationId || undefined,
      subdomain: subdomain || undefined,
      ...headerProps
    })
  , [organizationName, organizationId, subdomain, headerProps]);

  // Show loading state while fetching tier info
  if (!orgTier || !availableComponents) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Puck
        config={filteredConfig}
        data={data}
        onPublish={onSave}
        overrides={puckOverrides}
      />
    </div>
  );
};

export default TierBasedPuckEditor;
