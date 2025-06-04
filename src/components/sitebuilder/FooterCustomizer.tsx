
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FooterCustomizerProps {
  organizationId: string | null;
  onChanges: () => void;
}

interface FooterLink {
  id: string;
  label: string;
  url: string;
}

interface FooterSettings {
  show_footer: boolean;
  footer_text: string;
  background_color: string;
  text_color: string;
  links: FooterLink[];
  copyright_text: string;
}

const FooterCustomizer: React.FC<FooterCustomizerProps> = ({ organizationId, onChanges }) => {
  const [settings, setSettings] = useState<FooterSettings>({
    show_footer: true,
    footer_text: '',
    background_color: '#f8f9fa',
    text_color: '#6b7280',
    links: [],
    copyright_text: '',
  });

  useEffect(() => {
    if (organizationId) {
      loadFooterSettings();
    }
  }, [organizationId]);

  const loadFooterSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('footer_config')
        .eq('organization_id', organizationId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading footer settings:', error);
        return;
      }

      if (data?.footer_config) {
        const config = data.footer_config;
        setSettings({
          show_footer: config.show_footer ?? true,
          footer_text: config.text || '',
          background_color: config.background_color || '#f8f9fa',
          text_color: config.text_color || '#6b7280',
          links: config.links || [],
          copyright_text: config.copyright_text || '',
        });
      }
    } catch (error) {
      console.error('Error loading footer settings:', error);
    }
  };

  const handleSettingChange = (key: keyof FooterSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    onChanges();
  };

  const addFooterLink = () => {
    const newLink: FooterLink = {
      id: `link-${Date.now()}`,
      label: 'New Link',
      url: '#',
    };
    handleSettingChange('links', [...settings.links, newLink]);
  };

  const updateFooterLink = (id: string, updates: Partial<FooterLink>) => {
    const updatedLinks = settings.links.map(link => 
      link.id === id ? { ...link, ...updates } : link
    );
    handleSettingChange('links', updatedLinks);
  };

  const deleteFooterLink = (id: string) => {
    const updatedLinks = settings.links.filter(link => link.id !== id);
    handleSettingChange('links', updatedLinks);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Switch
          id="show-footer"
          checked={settings.show_footer}
          onCheckedChange={(checked) => handleSettingChange('show_footer', checked)}
        />
        <Label htmlFor="show-footer">Show footer on all pages</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="footer-text">Footer Text</Label>
        <Textarea
          id="footer-text"
          value={settings.footer_text}
          onChange={(e) => handleSettingChange('footer_text', e.target.value)}
          placeholder="Enter footer description or contact information"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="copyright">Copyright Text</Label>
        <Input
          id="copyright"
          value={settings.copyright_text}
          onChange={(e) => handleSettingChange('copyright_text', e.target.value)}
          placeholder="© 2024 Your Organization. All rights reserved."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="footer-bg-color">Background Color</Label>
          <div className="flex gap-2">
            <input
              type="color"
              id="footer-bg-color"
              value={settings.background_color}
              onChange={(e) => handleSettingChange('background_color', e.target.value)}
              className="w-12 h-10 border rounded"
            />
            <Input
              value={settings.background_color}
              onChange={(e) => handleSettingChange('background_color', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="footer-text-color">Text Color</Label>
          <div className="flex gap-2">
            <input
              type="color"
              id="footer-text-color"
              value={settings.text_color}
              onChange={(e) => handleSettingChange('text_color', e.target.value)}
              className="w-12 h-10 border rounded"
            />
            <Input
              value={settings.text_color}
              onChange={(e) => handleSettingChange('text_color', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-medium">Footer Links</Label>
          <Button onClick={addFooterLink} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Link
          </Button>
        </div>

        {settings.links.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No footer links yet. Add some links to get started.
          </p>
        ) : (
          <div className="space-y-2">
            {settings.links.map((link) => (
              <Card key={link.id}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Input
                      value={link.label}
                      onChange={(e) => updateFooterLink(link.id, { label: e.target.value })}
                      placeholder="Link text"
                      className="flex-1"
                    />
                    <Input
                      value={link.url}
                      onChange={(e) => updateFooterLink(link.id, { url: e.target.value })}
                      placeholder="URL"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteFooterLink(link.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FooterCustomizer;
