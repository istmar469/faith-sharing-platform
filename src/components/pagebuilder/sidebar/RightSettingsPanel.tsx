
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, Globe, FileText } from 'lucide-react';
import { usePageBuilder } from '../context/PageBuilderContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';

const RightSettingsPanel: React.FC = () => {
  const { 
    pageTitle, setPageTitle,
    pageSlug, setPageSlug,
    metaTitle, setMetaTitle,
    metaDescription, setMetaDescription,
    showInNavigation, setShowInNavigation,
    isHomepage, setIsHomepage,
    savePage
  } = usePageBuilder();

  const handleSaveSettings = async () => {
    try {
      toast.info("Saving page settings...");
      await savePage();
      toast.success("Page settings saved successfully");
    } catch (error) {
      console.error("Error saving page settings:", error);
      toast.error("Error saving page settings");
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="h-5 w-5" />
          <h3 className="font-medium">Page Settings</h3>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full mx-4 mt-4">
            <TabsTrigger value="general" className="flex-1 text-xs">
              <FileText className="h-3 w-3 mr-1" />
              General
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex-1 text-xs">
              <Globe className="h-3 w-3 mr-1" />
              SEO
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="page-title">Page Title</Label>
              <Input 
                id="page-title"
                value={pageTitle}
                onChange={e => setPageTitle(e.target.value)}
                placeholder="Page Title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="page-slug">Slug</Label>
              <Input 
                id="page-slug"
                value={pageSlug}
                onChange={e => setPageSlug(e.target.value)}
                placeholder="page-slug"
              />
              <p className="text-xs text-gray-500">URL: yourdomain.com/{pageSlug}</p>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-in-nav">Show in Navigation</Label>
                <p className="text-xs text-gray-500">Display in site navigation menu</p>
              </div>
              <Switch 
                id="show-in-nav"
                checked={showInNavigation}
                onCheckedChange={setShowInNavigation} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is-homepage">Set as Homepage</Label>
                <p className="text-xs text-gray-500">Make this the main landing page</p>
              </div>
              <Switch 
                id="is-homepage"
                checked={isHomepage}
                onCheckedChange={setIsHomepage}
              />
            </div>
            
            <Button onClick={handleSaveSettings} className="w-full mt-4">
              Save Settings
            </Button>
          </TabsContent>
          
          <TabsContent value="seo" className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meta-title">Meta Title</Label>
              <Input 
                id="meta-title"
                value={metaTitle}
                onChange={e => setMetaTitle(e.target.value)}
                placeholder="Meta Title"
              />
              <p className="text-xs text-gray-500">Title shown in search results (50-60 chars)</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="meta-description">Meta Description</Label>
              <Textarea 
                id="meta-description"
                value={metaDescription}
                onChange={e => setMetaDescription(e.target.value)}
                placeholder="Meta Description"
                rows={4}
              />
              <p className="text-xs text-gray-500">Description shown in search results (150-160 chars)</p>
            </div>
            
            <Button onClick={handleSaveSettings} className="w-full mt-4">
              Save SEO Settings
            </Button>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
};

export default RightSettingsPanel;
