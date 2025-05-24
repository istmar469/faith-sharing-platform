
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

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
      .from('site_settings')
      .select('*')
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching site settings:', error);
      return null;
    }

    return data as SiteSettings;
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return null;
  }
}

export async function saveSiteSettings(settings: SiteSettings): Promise<SiteSettings | null> {
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

  try {
    if (settings.id) {
      const { data, error } = await supabase
        .from('site_settings')
        .update(dataToSave)
        .eq('id', settings.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating site settings:', error);
        return null;
      }
      return data as SiteSettings;
    } else {
      const { data, error } = await supabase
        .from('site_settings')
        .insert(dataToSave)
        .select()
        .single();

      if (error) {
        console.error('Error creating site settings:', error);
        return null;
      }
      return data as SiteSettings;
    }
  } catch (error) {
    console.error('Error saving site settings:', error);
    return null;
  }
}
