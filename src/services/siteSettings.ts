
import { supabase } from '@/integrations/supabase/client';

export interface SiteSettings {
  id?: string;
  organization_id: string;
  site_title: string;
  site_description?: string;
  logo_url?: string;
  favicon_url?: string;
  header_config: {
    logo?: string;
    navigation?: Array<{
      id: string;
      label: string;
      url: string;
      target?: string;
    }>;
    show_navigation?: boolean;
  };
  footer_config: {
    text?: string;
    links?: Array<{
      id: string;
      label: string;
      url: string;
    }>;
    show_footer?: boolean;
  };
  theme_config: {
    primary_color?: string;
    secondary_color?: string;
    font_family?: string;
    custom_css?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export async function getSiteSettings(organizationId: string): Promise<SiteSettings | null> {
  try {
    const { data, error } = await supabase
      .from('site_settings' as any)
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data as SiteSettings;
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return null;
  }
}

export async function saveSiteSettings(settings: SiteSettings): Promise<SiteSettings> {
  const dataToSave = {
    organization_id: settings.organization_id,
    site_title: settings.site_title,
    site_description: settings.site_description,
    logo_url: settings.logo_url,
    favicon_url: settings.favicon_url,
    header_config: settings.header_config,
    footer_config: settings.footer_config,
    theme_config: settings.theme_config
  };

  if (settings.id) {
    const { data, error } = await supabase
      .from('site_settings' as any)
      .update(dataToSave)
      .eq('id', settings.id)
      .select()
      .single();

    if (error) throw error;
    return data as SiteSettings;
  } else {
    const { data, error } = await supabase
      .from('site_settings' as any)
      .insert(dataToSave)
      .select()
      .single();

    if (error) throw error;
    return data as SiteSettings;
  }
}
