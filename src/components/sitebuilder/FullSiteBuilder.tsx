
import React, { useState, useEffect } from 'react';
import { useTenantContext } from '@/components/context/TenantContext';
import { getSiteSettings, SiteSettings } from '@/services/siteSettings';
import { usePageData } from '@/components/pagebuilder/hooks/usePageData';
import { PluginSystemProvider } from '@/components/dashboard/PluginSystemProvider';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import SiteSettingsPanel from './SiteSettingsPanel';
import NavigationPanel from './NavigationPanel';
import MinimalEditor from '@/components/pagebuilder/MinimalEditor';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, FileText, Eye, Save, Navigation } from 'lucide-react';
import { toast } from 'sonner';

const FullSiteBuilder: React.FC = () => {
  const { organizationId } = useTenantContext();
  const { pageData, setPageData } = usePageData();
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [activeTab, setActiveTab] = useState('content');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (!organizationId) return;

    const loadSiteSettings = async () => {
      try {
        const settings = await getSiteSettings(organizationId);
        setSiteSettings(settings);
      } catch (error) {
        console.error('Error loading site settings:', error);
      }
    };

    loadSiteSettings();
  }, [organizationId]);

  // Create dynamic styles based on theme settings
  const dynamicStyles = siteSettings?.theme_config ? {
    '--primary-color': siteSettings.theme_config.primary_color || '#3b82f6',
    '--secondary-color': siteSettings.theme_config.secondary_color || '#64748b',
  } as React.CSSProperties : {};

  if (previewMode && siteSettings && pageData) {
    return (
      <div style={dynamicStyles} className="min-h-screen flex flex-col">
        <SiteHeader settings={siteSettings} />
        <main className="flex-1">
          <div className="max-w-4xl mx-auto py-8 px-4">
            <article className="bg-white rounded-lg shadow-sm p-8">
              <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{pageData.title}</h1>
                {pageData.meta_description && (
                  <p className="text-lg text-gray-600">{pageData.meta_description}</p>
                )}
              </header>
              <div className="prose prose-lg max-w-none">
                {/* Render page content here */}
              </div>
            </article>
          </div>
        </main>
        <SiteFooter settings={siteSettings} />
        <div className="fixed top-4 right-4">
          <Button onClick={() => setPreviewMode(false)}>
            Exit Preview
          </Button>
        </div>
        {siteSettings.theme_config.custom_css && (
          <style dangerouslySetInnerHTML={{ __html: siteSettings.theme_config.custom_css }} />
        )}
      </div>
    );
  }

  return (
    <PluginSystemProvider organizationId={organizationId}>
      <div className="h-screen flex">
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Header with Preview Toggle */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">Full Site Builder</h1>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPreviewMode(true)}
                  disabled={!siteSettings || !pageData}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Site
                </Button>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save All
                </Button>
              </div>
            </div>
          </div>

          {/* Site Preview Area */}
          <div style={dynamicStyles} className="flex-1 bg-gray-100 overflow-auto">
            {siteSettings && (
              <>
                <SiteHeader settings={siteSettings} isEditing />
                <main className="min-h-[400px] bg-white mx-4 my-4 rounded-lg shadow-sm">
                  <div className="max-w-4xl mx-auto p-8">
                    {pageData && (
                      <>
                        <div className="mb-6">
                          <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {pageData.title}
                          </h1>
                          <p className="text-sm text-gray-500">
                            Editing page content below
                          </p>
                        </div>
                        <MinimalEditor
                          initialData={pageData.content}
                          onSave={(data) => {
                            if (pageData) {
                              setPageData({ ...pageData, content: data });
                            }
                          }}
                        />
                      </>
                    )}
                  </div>
                </main>
                <SiteFooter settings={siteSettings} isEditing />
              </>
            )}
            {siteSettings?.theme_config.custom_css && (
              <style dangerouslySetInnerHTML={{ __html: siteSettings.theme_config.custom_css }} />
            )}
          </div>
        </div>

        {/* Right Sidebar - Settings Panel */}
        <div className="w-80 bg-white border-l border-gray-200">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="navigation" className="flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                Navigation
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Site
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="flex-1 m-0">
              <div className="p-4">
                <h3 className="font-medium mb-4">Page Content Settings</h3>
                <p className="text-sm text-gray-600">
                  Edit your page content in the main editor area. Use the settings tab to configure your site's header, footer, and theme.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="navigation" className="flex-1 m-0 overflow-auto">
              <NavigationPanel organizationId={organizationId} />
            </TabsContent>

            <TabsContent value="settings" className="flex-1 m-0">
              <SiteSettingsPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PluginSystemProvider>
  );
};

export default FullSiteBuilder;
