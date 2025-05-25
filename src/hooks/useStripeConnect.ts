
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StripeConnectAccount {
  id: string;
  organization_id: string;
  stripe_account_id: string;
  is_verified: boolean;
  created_at: string;
}

export const useStripeConnect = (organizationId: string) => {
  const [account, setAccount] = useState<StripeConnectAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccount = async () => {
      if (!organizationId) return;

      try {
        const { data, error } = await supabase
          .from('stripe_integrations')
          .select('*')
          .eq('organization_id', organizationId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        // Handle the case where data might be null or missing properties
        if (data) {
          const accountData: StripeConnectAccount = {
            id: data.id,
            organization_id: data.organization_id,
            stripe_account_id: data.stripe_account_id,
            is_verified: Boolean(data.is_verified), // Safely convert to boolean
            created_at: data.created_at
          };
          setAccount(accountData);
        } else {
          setAccount(null);
        }
      } catch (err) {
        console.error('Error fetching Stripe Connect account:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch account');
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [organizationId]);

  const createConnectAccount = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-connect-account', {
        body: { organizationId }
      });

      if (error) throw error;

      if (data.account_link) {
        window.open(data.account_link, '_blank');
      }
    } catch (err) {
      console.error('Error creating Connect account:', err);
      throw err;
    }
  };

  return { account, loading, error, createConnectAccount };
};
