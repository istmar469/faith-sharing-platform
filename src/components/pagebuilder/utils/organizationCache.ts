
// Simple in-memory cache for organization data
const orgDataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getCachedOrgData = async (organizationId: string) => {
  const cached = orgDataCache.get(organizationId);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    console.log("organizationCache: Using cached organization data");
    return cached.data;
  }
  
  const { supabase } = await import('@/integrations/supabase/client');
  const { data, error } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', organizationId)
    .single();
    
  if (!error && data) {
    orgDataCache.set(organizationId, { data, timestamp: now });
  }
  
  return data;
};
