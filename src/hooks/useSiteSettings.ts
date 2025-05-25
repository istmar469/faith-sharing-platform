
import { useState, useEffect } from 'react';
import { getSiteSettings, SiteSettings } from '@/services/siteSettings';

interface UseSiteSettingsReturn {
  siteSettings: SiteSettings | null;
  loading: boolean;
  error: string | null;
}

export const useSiteSettings = (organizationId?: string): UseSiteSettingsReturn => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      if (!organizationId) {
        setSiteSettings(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const settings = await getSiteSettings(organizationId);
        setSiteSettings(settings);
      } catch (err) {
        console.error('Error fetching site settings:', err);
        setError('Failed to load site settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSiteSettings();
  }, [organizationId]);

  return { siteSettings, loading, error };
};
