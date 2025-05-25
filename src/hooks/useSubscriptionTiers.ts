
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionTier {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  display_order: number;
  is_active: boolean;
}

export const useSubscriptionTiers = () => {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_tiers')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (error) throw error;

        setTiers(data || []);
      } catch (err) {
        console.error('Error fetching subscription tiers:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch tiers');
      } finally {
        setLoading(false);
      }
    };

    fetchTiers();
  }, []);

  return { tiers, loading, error };
};
