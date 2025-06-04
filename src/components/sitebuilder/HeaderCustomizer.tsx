
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HeaderCustomizerProps {
  organizationId: string | null;
  onChanges: () => void;
}

interface HeaderSettings {
  show_header: boolean;
  site_title: string;
  logo_url?: string;
  header_background_color: string;
  text_color: string;
  show_search: boolean;
}

const HeaderCustomizer: React.FC<HeaderCustomizerProps> = ({ organizationId, onChanges }) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<HeaderSettings>({
    show_header: true,
    site_title: '',
    header_background_color: '#ffffff',
    text_color: '#000000',
    show_search: false,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (organizationId) {
      loadHeaderSettings();
    }
  }, [organizationId]);

  const loadHeaderSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('header_config, site_title, logo_url')
        .eq('organization_id', organizationId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading header settings:', error);
        return;
      }

      if (data) {
        const headerConfig = (data.header_config as any) || {};
        setSettings({
          show_header: headerConfig.show_header ?? true,
          site_title: data.site_title || '',
          logo_url: data.logo_url,
          header_background_color: headerConfig.background_color || '#ffffff',
          text_color: headerConfig.text_color || '#000000',
          show_search: headerConfig.show_search ?? false,
        });
      }
    } catch (error) {
      console.error('Error loading header settings:', error);
    }
  };

  const handleSettingChange = (key: keyof HeaderSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    onChanges();
  };

  const handleLogoUpload = async (file: File) => {
    if (!organizationId) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${organizationId}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(fileName);

      handleSettingChange('logo_url', publicUrl);
      
      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    handleSettingChange('logo_url', undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Switch
          id="show-header"
          checked={settings.show_header}
          onCheckedChange={(checked) => handleSettingChange('show_header', checked)}
        />
        <Label htmlFor="show-header">Show header on all pages</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="site-title">Site Title</Label>
        <Input
          id="site-title"
          value={settings.site_title}
          onChange={(e) => handleSettingChange('site_title', e.target.value)}
          placeholder="Enter your site title"
        />
      </div>

      <div className="space-y-2">
        <Label>Logo</Label>
        {settings.logo_url ? (
          <div className="flex items-center gap-4">
            <img 
              src={settings.logo_url} 
              alt="Site logo" 
              className="h-12 w-auto border rounded"
            />
            <Button variant="outline" size="sm" onClick={removeLogo}>
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLogoUpload(file);
              }}
              className="hidden"
              id="logo-upload"
            />
            <label htmlFor="logo-upload" className="cursor-pointer">
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {uploading ? 'Uploading...' : 'Click to upload logo'}
                </p>
              </div>
            </label>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bg-color">Background Color</Label>
          <div className="flex gap-2">
            <input
              type="color"
              id="bg-color"
              value={settings.header_background_color}
              onChange={(e) => handleSettingChange('header_background_color', e.target.value)}
              className="w-12 h-10 border rounded"
            />
            <Input
              value={settings.header_background_color}
              onChange={(e) => handleSettingChange('header_background_color', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="text-color">Text Color</Label>
          <div className="flex gap-2">
            <input
              type="color"
              id="text-color"
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

      <div className="flex items-center space-x-2">
        <Switch
          id="show-search"
          checked={settings.show_search}
          onCheckedChange={(checked) => handleSettingChange('show_search', checked)}
        />
        <Label htmlFor="show-search">Show search bar in header</Label>
      </div>
    </div>
  );
};

export default HeaderCustomizer;
