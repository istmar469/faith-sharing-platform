
import { supabase } from '@/integrations/supabase/client';

export const checkSuperAdmin = async (): Promise<boolean> => {
  try {
    // Use the direct super admin check RPC function which is faster and more reliable
    const { data, error } = await supabase.rpc('direct_super_admin_check');
    
    if (error) {
      console.error('Error checking super admin status:', error);
      return false;
    }
    
    return !!data;
  } catch (err) {
    console.error('Unexpected error checking super admin status:', err);
    return false;
  }
};
