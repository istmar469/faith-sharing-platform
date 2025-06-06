import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Move, Save, Eye, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTenantContext } from '@/components/context/TenantContext';

interface NavigationItem {
  id: string;
  label: string;
  url: string;
  target: '_self' | '_blank';
  order: number;
}

interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  email?: string;
  phone?: string;
  website?: string;
}

interface HeaderConfig {
  show_header?: boolean;
  show_navigation?: boolean;
  background_color?: string;
  text_color?: string;
  navigation?: NavigationItem[];
  show_search?: boolean;
}

interface FooterConfig {
  show_footer?: boolean;
  background_color?: string;
  text_color?: string;
  text?: string;
  copyright_text?: string;
  social_media?: SocialMediaLinks;
  links?: Array<{
    id: string;
    label: string;
    url: string;
  }>;
}

interface SiteSettings {
  site_title?: string;
  logo_url?: string;
  header_config?: HeaderConfig;
  footer_config?: FooterConfig;
}

const HeaderSettingsManager: React.FC = () => {
  const { organizationId } = useTenantContext();
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [organizationId]);

  const loadSettings = async () => {
    if (!organizationId) return;

    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('organization_id', organizationId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading settings:', error);
        return;
      }

      setSettings(data || {});
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!organizationId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          organization_id: organizationId,
          ...settings
        });

      if (error) throw error;

      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateHeaderConfig = (updates: Partial<HeaderConfig>) => {
    setSettings(prev => ({
      ...prev,
      header_config: {
        ...prev.header_config,
        ...updates
      }
    }));
  };

  const updateFooterConfig = (updates: Partial<FooterConfig>) => {
    setSettings(prev => ({
      ...prev,
      footer_config: {
        ...prev.footer_config,
        ...updates
      }
    }));
  };

  const addNavigationItem = () => {
    const navigation = settings.header_config?.navigation || [];
    const newItem: NavigationItem = {
      id: Date.now().toString(),
      label: 'New Page',
      url: '/new-page',
      target: '_self',
      order: navigation.length + 1
    };

    updateHeaderConfig({
      navigation: [...navigation, newItem]
    });
  };

  const updateNavigationItem = (id: string, updates: Partial<NavigationItem>) => {
    const navigation = settings.header_config?.navigation || [];
    const updatedNavigation = navigation.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );

    updateHeaderConfig({ navigation: updatedNavigation });
  };

  const removeNavigationItem = (id: string) => {
    const navigation = settings.header_config?.navigation || [];
    const filteredNavigation = navigation.filter(item => item.id !== id);

    updateHeaderConfig({ navigation: filteredNavigation });
  };

  const updateSocialMedia = (platform: string, url: string) => {
    const socialMedia = settings.footer_config?.social_media || {};
    updateFooterConfig({
      social_media: {
        ...socialMedia,
        [platform]: url
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const headerConfig = settings.header_config || {};
  const footerConfig = settings.footer_config || {};
  const navigation = headerConfig.navigation || [];
  const socialMedia = footerConfig.social_media || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Header & Footer Settings</h2>
          <p className="text-gray-600">Configure your site's header navigation and footer content</p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="header" className="space-y-6">
        <TabsList>
          <TabsTrigger value="header">Header Settings</TabsTrigger>
          <TabsTrigger value="footer">Footer Settings</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
        </TabsList>

        <TabsContent value="header" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Title & Logo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="site_title">Site Title</Label>
                <Input
                  id="site_title"
                  value={settings.site_title || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, site_title: e.target.value }))}
                  placeholder="Your Organization Name"
                />
              </div>
              <div>
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  value={settings.logo_url || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, logo_url: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Header Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={headerConfig.show_header !== false}
                  onCheckedChange={(checked) => updateHeaderConfig({ show_header: checked })}
                />
                <Label>Show Header</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bg_color">Background Color</Label>
                  <Input
                    id="bg_color"
                    type="color"
                    value={headerConfig.background_color || '#ffffff'}
                    onChange={(e) => updateHeaderConfig({ background_color: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="text_color">Text Color</Label>
                  <Input
                    id="text_color"
                    type="color"
                    value={headerConfig.text_color || '#1f2937'}
                    onChange={(e) => updateHeaderConfig({ text_color: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={headerConfig.show_search === true}
                  onCheckedChange={(checked) => updateHeaderConfig({ show_search: checked })}
                />
                <Label>Show Search Bar</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Navigation Menu</CardTitle>
                  <CardDescription>Add and organize your navigation links</CardDescription>
                </div>
                <Button onClick={addNavigationItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={headerConfig.show_navigation !== false}
                  onCheckedChange={(checked) => updateHeaderConfig({ show_navigation: checked })}
                />
                <Label>Show Navigation</Label>
              </div>

              {navigation.map((item) => (
                <div key={item.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <Input
                      value={item.label}
                      onChange={(e) => updateNavigationItem(item.id, { label: e.target.value })}
                      placeholder="Label"
                    />
                    <Input
                      value={item.url}
                      onChange={(e) => updateNavigationItem(item.id, { url: e.target.value })}
                      placeholder="URL"
                    />
                    <select
                      value={item.target}
                      onChange={(e) => updateNavigationItem(item.id, { target: e.target.value as '_self' | '_blank' })}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="_self">Same Window</option>
                      <option value="_blank">New Window</option>
                    </select>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeNavigationItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Footer Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={footerConfig.show_footer !== false}
                  onCheckedChange={(checked) => updateFooterConfig({ show_footer: checked })}
                />
                <Label>Show Footer</Label>
              </div>

              <div>
                <Label htmlFor="footer_text">Footer Description</Label>
                <Input
                  id="footer_text"
                  value={footerConfig.text || ''}
                  onChange={(e) => updateFooterConfig({ text: e.target.value })}
                  placeholder="Join us for worship, fellowship, and growing in faith together."
                />
              </div>

              <div>
                <Label htmlFor="copyright_text">Copyright Text</Label>
                <Input
                  id="copyright_text"
                  value={footerConfig.copyright_text || ''}
                  onChange={(e) => updateFooterConfig({ copyright_text: e.target.value })}
                  placeholder="© 2024 Your Organization. All rights reserved."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="footer_bg_color">Background Color</Label>
                  <Input
                    id="footer_bg_color"
                    type="color"
                    value={footerConfig.background_color || '#f8f9fa'}
                    onChange={(e) => updateFooterConfig({ background_color: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="footer_text_color">Text Color</Label>
                  <Input
                    id="footer_text_color"
                    type="color"
                    value={footerConfig.text_color || '#6b7280'}
                    onChange={(e) => updateFooterConfig({ text_color: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Add your social media profiles (leave blank to hide)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourpage' },
                { key: 'twitter', label: 'Twitter', placeholder: 'https://twitter.com/yourhandle' },
                { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourprofile' },
                { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel' },
                { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourcompany' },
                { key: 'email', label: 'Email', placeholder: 'contact@yourorganization.com' },
                { key: 'phone', label: 'Phone', placeholder: '+1 (555) 123-4567' },
                { key: 'website', label: 'Website', placeholder: 'https://yourwebsite.com' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    value={socialMedia[key as keyof SocialMediaLinks] || ''}
                    onChange={(e) => updateSocialMedia(key, e.target.value)}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HeaderSettingsManager; 