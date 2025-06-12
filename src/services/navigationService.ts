import { supabase } from '@/integrations/supabase/client';

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  target: '_self' | '_blank';
  order: number;
  type: 'page' | 'custom';
  pageId?: string;
  isExternal?: boolean;
}

export interface DynamicNavigationResult {
  success: boolean;
  data: NavigationItem[];
  error?: string;
}

/**
 * Get dynamic navigation items for an organization
 * Combines pages marked for navigation with custom navigation items
 */
export async function getDynamicNavigation(organizationId: string): Promise<DynamicNavigationResult> {
  try {
    if (!organizationId) {
      return { success: false, data: [], error: 'Organization ID is required' };
    }

    // Fetch pages that should appear in navigation
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('id, title, slug, is_homepage, show_in_navigation, display_order')
      .eq('organization_id', organizationId)
      .eq('published', true)
      .eq('show_in_navigation', true)
      .order('display_order', { ascending: true });

    if (pagesError) {
      console.error('Error fetching navigation pages:', pagesError);
      return { success: false, data: [], error: pagesError.message };
    }

    // Fetch custom navigation items from site settings
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('header_config')
      .eq('organization_id', organizationId)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('Error fetching navigation settings:', settingsError);
    }

    const customNavigation = (settings?.header_config as any)?.custom_navigation || [];

    // Convert pages to navigation items
    const pageNavItems: NavigationItem[] = (pages || []).map(page => ({
      id: `page-${page.id}`,
      label: page.title,
      url: page.is_homepage ? '/' : `/${page.slug}`,
      target: '_self' as const,
      order: page.display_order || 999,
      type: 'page' as const,
      pageId: page.id,
      isExternal: false
    }));

    // Convert custom navigation items
    const customNavItems: NavigationItem[] = customNavigation.map((item: any, index: number) => ({
      id: `custom-${item.id || index}`,
      label: item.label,
      url: item.url,
      target: item.target || '_self',
      order: item.order || (1000 + index),
      type: 'custom' as const,
      isExternal: item.isExternal || item.url.startsWith('http')
    }));

    // Combine and sort all navigation items
    const allItems = [...pageNavItems, ...customNavItems]
      .sort((a, b) => a.order - b.order);

    return {
      success: true,
      data: allItems
    };

  } catch (error) {
    console.error('Error in getDynamicNavigation:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Update navigation order for pages
 */
export async function updateNavigationOrder(organizationId: string, pageOrders: { pageId: string; order: number }[]): Promise<boolean> {
  try {
    const updates = pageOrders.map(({ pageId, order }) => 
      supabase
        .from('pages')
        .update({ display_order: order })
        .eq('id', pageId)
        .eq('organization_id', organizationId)
    );

    await Promise.all(updates);
    return true;
  } catch (error) {
    console.error('Error updating navigation order:', error);
    return false;
  }
}

/**
 * Toggle page visibility in navigation
 */
export async function togglePageInNavigation(organizationId: string, pageId: string, showInNavigation: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('pages')
      .update({ show_in_navigation: showInNavigation })
      .eq('id', pageId)
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error toggling page navigation visibility:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in togglePageInNavigation:', error);
    return false;
  }
}

/**
 * Add or update custom navigation item
 */
export async function saveCustomNavigationItem(organizationId: string, item: Omit<NavigationItem, 'id' | 'type'>): Promise<boolean> {
  try {
    // Get current settings
    const { data: settings, error: fetchError } = await supabase
      .from('site_settings')
      .select('header_config')
      .eq('organization_id', organizationId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching settings:', fetchError);
      return false;
    }

    const currentConfig = (settings?.header_config as any) || {};
    const customNavigation = currentConfig.custom_navigation || [];
    
    const newItem = {
      ...item,
      id: Date.now().toString(),
      type: 'custom'
    };

    const updatedNavigation = [...customNavigation, newItem];

    // Update settings
    const { error: updateError } = await supabase
      .from('site_settings')
      .update({
        header_config: {
          ...currentConfig,
          custom_navigation: updatedNavigation
        }
      })
      .eq('organization_id', organizationId);

    if (updateError) {
      console.error('Error saving custom navigation item:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveCustomNavigationItem:', error);
    return false;
  }
} 