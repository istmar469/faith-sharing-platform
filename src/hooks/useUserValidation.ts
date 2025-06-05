
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserValidationResult {
  exists: boolean;
  organizations?: Array<{
    organization_id: string;
    organization_name: string;
    role: string;
  }>;
}

export const useUserValidation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkUserExists = async (email: string): Promise<UserValidationResult> => {
    setLoading(true);
    setError(null);

    try {
      // Check if user exists
      const { data: userExists, error: userError } = await supabase.rpc(
        'check_user_exists_by_email',
        { user_email: email }
      );

      if (userError) throw userError;

      if (!userExists) {
        return { exists: false };
      }

      // Get user's organization memberships
      const { data: memberships, error: membershipError } = await supabase.rpc(
        'get_user_organization_memberships',
        { user_email: email }
      );

      if (membershipError) throw membershipError;

      return {
        exists: true,
        organizations: memberships || []
      };
    } catch (err: any) {
      console.error('Error checking user:', err);
      setError(err.message || 'Failed to validate user');
      return { exists: false };
    } finally {
      setLoading(false);
    }
  };

  const validateSubdomain = async (subdomain: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc(
        'check_subdomain_availability',
        { subdomain_name: subdomain }
      );

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error validating subdomain:', err);
      return false;
    }
  };

  return {
    checkUserExists,
    validateSubdomain,
    loading,
    error
  };
};
