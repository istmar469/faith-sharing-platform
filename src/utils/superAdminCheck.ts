import { supabase } from '@/integrations/supabase/client';

/**
 * The unified super admin check function
 * This is the ONLY function that should be used to check super admin status
 */
export const isSuperAdmin = async (): Promise<boolean> => {
  try {
    console.log('🔧 isSuperAdmin: Starting super admin check...');
    
    // First check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('🔧 isSuperAdmin: Error getting user:', userError);
      return false;
    }
    
    if (!user) {
      console.log('🔧 isSuperAdmin: No authenticated user found');
      return false;
    }
    
    console.log('🔧 isSuperAdmin: Checking super admin status for user:', user.email);
    
    const { data, error } = await supabase.rpc('is_super_admin');
    
    if (error) {
      console.error('🔧 isSuperAdmin: RPC error:', error);
      return false;
    }
    
    console.log('🔧 isSuperAdmin: RPC result:', data);
    const result = !!data;
    console.log('🔧 isSuperAdmin: Final result:', result);
    
    return result;
  } catch (err) {
    console.error('🔧 isSuperAdmin: Unexpected error:', err);
    return false;
  }
};

/**
 * Check if a specific user is a super admin
 */
export const isSuperAdminById = async (userId: string): Promise<boolean> => {
  try {
    console.log('🔧 isSuperAdminById: Checking super admin status for user ID:', userId);
    
    const { data, error } = await supabase.rpc('is_super_admin', { user_id: userId });
    
    if (error) {
      console.error('🔧 isSuperAdminById: RPC error:', error);
      return false;
    }
    
    console.log('🔧 isSuperAdminById: RPC result:', data);
    const result = !!data;
    console.log('🔧 isSuperAdminById: Final result:', result);
    
    return result;
  } catch (err) {
    console.error('🔧 isSuperAdminById: Unexpected error:', err);
    return false;
  }
};

// Legacy function - DO NOT USE - kept for compatibility during migration
export const checkSuperAdmin = isSuperAdmin; 