
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Palette, Eye, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTenantContext } from '@/components/context/TenantContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import HeaderCustomizer from './HeaderCustomizer';
import FooterCustomizer from './FooterCustomizer';
import NavigationManager from './NavigationManager';

const SiteCustomizer: React.FC = () => {
  const { organizationId } = useTenantContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [headerSettings, setHeaderSettings] = useState<any>({});
  const [footerSettings, setFooterSettings] = useState<any>({});
  const [navigationItems, setNavigationItems] = useState<any[]>([]);

  const handleBack = () => {
    navigate('/');
  };

  const handlePreview = () => {
    window.open('/', '_blank');
  };

  const handleSave = async () => {
    if (!organizationId) return;
    
    setSaving(true);
    try {
      // Prepare the data to save
      const headerConfig = {
        show_header: headerSettings.show_header ?? true,
        background_color: headerSettings.header_background_color || '#ffffff',
        text_color: headerSettings.text_color || '#000000',
        show_search: headerSettings.show_search ?? false,
        navigation: navigationItems
      };

      const footerConfig = {
        show_footer: footerSettings.show_footer ?? true,
        background_color: footerSettings.background_color || '#f8f9fa',
        text_color: footerSettings.text_color || '#6b7280',
        text: footerSettings.footer_text || '',
        links: footerSettings.links || [],
        copyright_text: footerSettings.copyright_text || ''
      };

      // Update or insert site settings
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          organization_id: organizationId,
          site_title: headerSettings.site_title || '',
          logo_url: headerSettings.logo_url,
          header_config: headerConfig,
          footer_config: footerConfig,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'organization_id'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Site customizations saved successfully",
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving site settings:', error);
      toast({
        title: "Error",
        description: "Failed to save customizations",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChanges = () => {
    setHasChanges(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Site
            </Button>
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-600" />
                Site Customizer
              </h1>
              <p className="text-sm text-gray-600">Customize your site's header, footer, and navigation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePreview}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button 
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="header" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="header">Header</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="header" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Header Customization</CardTitle>
              </CardHeader>
              <CardContent>
                <HeaderCustomizer 
                  organizationId={organizationId}
                  onChanges={handleChanges}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="navigation" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Navigation Management</CardTitle>
              </CardHeader>
              <CardContent>
                <NavigationManager 
                  organizationId={organizationId}
                  onChanges={handleChanges}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="footer" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Footer Customization</CardTitle>
              </CardHeader>
              <CardContent>
                <FooterCustomizer 
                  organizationId={organizationId}
                  onChanges={handleChanges}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SiteCustomizer;
