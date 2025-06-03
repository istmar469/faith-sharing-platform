import React, { useState, useEffect } from 'react';
import { useTenantContext } from '@/components/context/TenantContext';
import { getSiteSettings, saveSiteSettings, SiteSettings } from '@/services/siteSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, Layout, Monitor, Maximize } from 'lucide-react';
import { toast } from 'sonner';

const SiteSettingsPanel: React.FC = () => {
  const { organizationId } = useTenantContext();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) return;

    const loadSettings = async () => {
      try {
        const data = await getSiteSettings(organizationId);
        if (data) {
          setSettings(data);
        } else {
          // Create default settings
          setSettings({
            organization_id: organizationId,
            site_title: 'My Website',
            site_description: '',
            header_config: {
              show_navigation: true,
              navigation: []
            },
            footer_config: {
              show_footer: true,
              text: '© 2024 My Website. All rights reserved.'
            },
            theme_config: {
              primary_color: '#3b82f6',
              secondary_color: '#64748b'
            },
            layout_config: {
              content_width: 'boxed',
              max_content_width: '1200px',
              container_padding: '1rem',
              enable_animations: true
            }
          });
        }
      } catch (error) {
        console.error('Error loading site settings:', error);
        toast.error('Failed to load site settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [organizationId]);

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const savedSettings = await saveSiteSettings(settings);
      setSettings(savedSettings);
      toast.success('Site settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save site settings');
    } finally {
      setSaving(false);
    }
  };

  const addNavItem = () => {
    if (!settings) return;
    const newItem = {
      id: Date.now().toString(),
      label: 'New Link',
      url: '/'
    };
    setSettings({
      ...settings,
      header_config: {
        ...settings.header_config,
        navigation: [...(settings.header_config.navigation || []), newItem]
      }
    });
  };

  const removeNavItem = (id: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      header_config: {
        ...settings.header_config,
        navigation: settings.header_config.navigation?.filter(item => item.id !== id) || []
      }
    });
  };

  const updateNavItem = (id: string, field: 'label' | 'url', value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      header_config: {
        ...settings.header_config,
        navigation: settings.header_config.navigation?.map(item =>
          item.id === id ? { ...item, [field]: value } : item
        ) || []
      }
    });
  };

  if (loading) {
    return <div className="p-6">Loading site settings...</div>;
  }

  if (!settings) {
    return <div className="p-6">Failed to load site settings</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Site Settings</h2>
        <Button onClick={handleSave} disabled={saving} size="sm">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="header">Header</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Basic site information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="site-title">Site Title</Label>
                  <Input
                    id="site-title"
                    value={settings.site_title}
                    onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="site-description">Site Description</Label>
                  <Textarea
                    id="site-description"
                    value={settings.site_description || ''}
                    onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="logo-url">Logo URL</Label>
                  <Input
                    id="logo-url"
                    value={settings.logo_url || ''}
                    onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5" />
                  Layout Settings
                </CardTitle>
                <CardDescription>Configure how your content is displayed across different screen sizes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="content-width">Content Width</Label>
                  <Select
                    value={settings.layout_config?.content_width || 'boxed'}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        layout_config: {
                          ...settings.layout_config,
                          content_width: value as 'boxed' | 'full-width' | 'wide',
                          max_content_width: settings.layout_config?.max_content_width || '1200px',
                          container_padding: settings.layout_config?.container_padding || '1rem',
                          enable_animations: settings.layout_config?.enable_animations ?? true
                        }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boxed">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Boxed</div>
                            <div className="text-xs text-gray-500">Standard container with margins</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="wide">
                        <div className="flex items-center gap-2">
                          <Layout className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Wide</div>
                            <div className="text-xs text-gray-500">Wider container for more content</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="full-width">
                        <div className="flex items-center gap-2">
                          <Maximize className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Full Width</div>
                            <div className="text-xs text-gray-500">Content spans entire screen</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-2">
                    {settings.layout_config?.content_width === 'boxed' && 'Content will be centered with comfortable margins on larger screens'}
                    {settings.layout_config?.content_width === 'wide' && 'Content will use a wider container for more spacious layouts'}
                    {settings.layout_config?.content_width === 'full-width' && 'Content will use the full screen width - ideal for hero sections and media'}
                  </p>
                </div>

                {settings.layout_config?.content_width !== 'full-width' && (
                  <div>
                    <Label htmlFor="max-content-width">Max Content Width</Label>
                    <Select
                      value={settings.layout_config?.max_content_width || '1200px'}
                      onValueChange={(value) =>
                        setSettings({
                          ...settings,
                          layout_config: {
                            ...settings.layout_config,
                            content_width: settings.layout_config?.content_width || 'boxed',
                            max_content_width: value,
                            container_padding: settings.layout_config?.container_padding || '1rem',
                            enable_animations: settings.layout_config?.enable_animations ?? true
                          }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1024px">1024px (Standard)</SelectItem>
                        <SelectItem value="1200px">1200px (Comfortable)</SelectItem>
                        <SelectItem value="1400px">1400px (Wide)</SelectItem>
                        <SelectItem value="1600px">1600px (Extra Wide)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="container-padding">Container Padding</Label>
                  <Select
                    value={settings.layout_config?.container_padding || '1rem'}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        layout_config: {
                          ...settings.layout_config,
                          content_width: settings.layout_config?.content_width || 'boxed',
                          max_content_width: settings.layout_config?.max_content_width || '1200px',
                          container_padding: value,
                          enable_animations: settings.layout_config?.enable_animations ?? true
                        }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5rem">Small (8px)</SelectItem>
                      <SelectItem value="1rem">Medium (16px)</SelectItem>
                      <SelectItem value="1.5rem">Large (24px)</SelectItem>
                      <SelectItem value="2rem">Extra Large (32px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable-animations">Enable Animations</Label>
                    <p className="text-sm text-gray-500">Smooth transitions when switching layouts</p>
                  </div>
                  <Switch
                    id="enable-animations"
                    checked={settings.layout_config?.enable_animations ?? true}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        layout_config: {
                          ...settings.layout_config,
                          content_width: settings.layout_config?.content_width || 'boxed',
                          max_content_width: settings.layout_config?.max_content_width || '1200px',
                          container_padding: settings.layout_config?.container_padding || '1rem',
                          enable_animations: checked
                        }
                      })
                    }
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Preview</h4>
                  <div className="bg-white border-2 border-dashed border-blue-200 rounded p-4">
                    <div 
                      className={`mx-auto bg-blue-100 rounded h-20 transition-all duration-300 ${
                        settings.layout_config?.content_width === 'full-width' 
                          ? 'w-full' 
                          : settings.layout_config?.content_width === 'wide'
                          ? 'w-5/6'
                          : 'w-4/5'
                      }`}
                      style={{
                        padding: settings.layout_config?.container_padding || '1rem'
                      }}
                    >
                      <div className="text-xs text-blue-700 text-center pt-8">
                        {settings.layout_config?.content_width} layout preview
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="header" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Header Settings</CardTitle>
                <CardDescription>Configure your site header and navigation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-nav">Show Navigation</Label>
                  <Switch
                    id="show-nav"
                    checked={settings.header_config.show_navigation}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        header_config: { ...settings.header_config, show_navigation: checked }
                      })
                    }
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Navigation Items</Label>
                    <Button onClick={addNavItem} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {settings.header_config.navigation?.map((item) => (
                      <div key={item.id} className="flex gap-2">
                        <Input
                          placeholder="Label"
                          value={item.label}
                          onChange={(e) => updateNavItem(item.id, 'label', e.target.value)}
                        />
                        <Input
                          placeholder="URL"
                          value={item.url}
                          onChange={(e) => updateNavItem(item.id, 'url', e.target.value)}
                        />
                        <Button
                          onClick={() => removeNavItem(item.id)}
                          size="sm"
                          variant="outline"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="footer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Footer Settings</CardTitle>
                <CardDescription>Configure your site footer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-footer">Show Footer</Label>
                  <Switch
                    id="show-footer"
                    checked={settings.footer_config.show_footer}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        footer_config: { ...settings.footer_config, show_footer: checked }
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="footer-text">Footer Text</Label>
                  <Input
                    id="footer-text"
                    value={settings.footer_config.text || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        footer_config: { ...settings.footer_config, text: e.target.value }
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="theme" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Theme Settings</CardTitle>
                <CardDescription>Customize your site's appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <Input
                    id="primary-color"
                    type="color"
                    value={settings.theme_config.primary_color || '#3b82f6'}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        theme_config: { ...settings.theme_config, primary_color: e.target.value }
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <Input
                    id="secondary-color"
                    type="color"
                    value={settings.theme_config.secondary_color || '#64748b'}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        theme_config: { ...settings.theme_config, secondary_color: e.target.value }
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="custom-css">Custom CSS</Label>
                  <Textarea
                    id="custom-css"
                    value={settings.theme_config.custom_css || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        theme_config: { ...settings.theme_config, custom_css: e.target.value }
                      })
                    }
                    placeholder="/* Add your custom CSS here */"
                    rows={10}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SiteSettingsPanel;
