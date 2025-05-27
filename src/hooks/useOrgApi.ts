import { useTenantContext } from '@/components/context/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner'; // Assuming toast might be used for error notifications

// Define a type for page data for better type safety
interface PageData {
  id?: string;
  organization_id?: string; // This will be set by the hook
  // Add other page properties here, e.g., title, content
  [key: string]: any; // Allow other properties
}

export function useOrgApi() {
  const { organizationId, isContextReady } = useTenantContext();

  const ensureContextReady = () => {
    if (!isContextReady) {
      const errorMsg = "Tenant context is not ready. API call cannot proceed.";
      console.error(errorMsg);
      toast.error(errorMsg); // Optional: notify user
      throw new Error(errorMsg);
    }
    if (!organizationId) {
      const errorMsg = "Organization ID is not available in the current context. API call cannot proceed.";
      console.error(errorMsg);
      toast.error(errorMsg); // Optional: notify user
      throw new Error(errorMsg);
    }
    return organizationId; // Return organizationId for convenience
  };

  const getPages = async () => {
    const currentOrgId = ensureContextReady();
    return supabase
      .from('pages')
      .select('*')
      .eq('organization_id', currentOrgId)
      .order('title');
  };

  const savePage = async (pageData: PageData) => {
    const currentOrgId = ensureContextReady();

    const scopedPageData = {
      ...pageData,
      organization_id: currentOrgId,
    };

    if (scopedPageData.id) {
      return supabase
        .from('pages')
        .update(scopedPageData)
        .eq('id', scopedPageData.id)
        .eq('organization_id', currentOrgId) // Ensure update is also scoped
        .select()
        .single();
    } else {
      return supabase
        .from('pages')
        .insert(scopedPageData)
        .select()
        .single();
    }
  };

  const getEvents = async () => {
    const currentOrgId = ensureContextReady();
    return supabase
      .from('events')
      .select('*')
      .eq('organization_id', currentOrgId)
      .order('date');
  };

  const getDonations = async () => {
    const currentOrgId = ensureContextReady();
    return supabase
      .from('donations')
      .select('*')
      .eq('organization_id', currentOrgId)
      .order('donation_date', { ascending: false });
  };

  const getOrganizationData = async (table: string, orderBy?: string) => {
    const currentOrgId = ensureContextReady();
    let query = supabase
      .from(table) // 'table as any' is not ideal, but Supabase types can be tricky here
      .select('*')
      .eq('organization_id', currentOrgId);

    if (orderBy) {
      // Supabase order options can be more complex, e.g. { ascending: boolean, nullsFirst: boolean }
      // For simplicity, assuming orderBy is just a string like "column" or "column.asc" or "column.desc"
      // More robust parsing might be needed for complex order strings.
      const [column, orderDirection] = orderBy.split('.');
      const ascending = orderDirection?.toLowerCase() !== 'desc';
      query = query.order(column, { ascending });
    }

    return query;
  };

  return {
    getPages,
    savePage,
    getEvents,
    getDonations,
    getOrganizationData,
    // Expose for direct check if needed, though methods handle it
    isContextReady, 
    organizationId 
  };
}
