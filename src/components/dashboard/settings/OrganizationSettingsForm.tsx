import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Globe, ExternalLink, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface OrganizationData {
  name: string;
  description: string | null;
  subdomain: string | null;
  custom_domain: string | null;
  website_enabled: boolean;
}

interface OrganizationSettingsFormProps {
  showComingSoonToast?: () => void;
}

const OrganizationSettingsForm: React.FC<OrganizationSettingsFormProps> = ({ 
  showComingSoonToast 
}) => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingSubdomain, setIsTestingSubdomain] = useState(false);
  const [settings, setSettings] = useState<OrganizationData>({
    name: '',
    description: null,
    subdomain: null,
    custom_domain: null,
    website_enabled: false,
  });

  React.useEffect(() => {
    if (organizationId) {
      loadOrganizationSettings();
    }
  }, [organizationId]);

  const loadOrganizationSettings = async () => {
    if (!organizationId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('name, description, subdomain, custom_domain, website_enabled')
        .eq('id', organizationId)
        .single();

      if (error) throw error;

      if (data) {
        setSettings({
          name: data.name || '',
          description: data.description,
          subdomain: data.subdomain,
          custom_domain: data.custom_domain,
          website_enabled: data.website_enabled || false,
        });
      }
    } catch (error) {
      console.error('Error loading organization settings:', error);
      toast({
        title: "Error",
        description: "Failed to load organization settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleChange = (checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      website_enabled: checked,
    }));
  };

  const handleSaveSettings = async () => {
    if (!organizationId) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: settings.name,
          description: settings.description,
          subdomain: settings.subdomain,
          custom_domain: settings.custom_domain,
          website_enabled: settings.website_enabled,
        })
        .eq('id', organizationId);

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Organization settings have been updated",
      });
    } catch (error) {
      console.error('Error saving organization settings:', error);
      toast({
        title: "Error",
        description: "Failed to save organization settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestSubdomain = () => {
    if (!settings.subdomain) {
      toast({
        title: "Missing Subdomain",
        description: "Please set a subdomain before testing",
        variant: "destructive",
      });
      return;
    }

    setIsTestingSubdomain(true);
    
    // Always use the preview route for testing
    window.open(`/preview-domain/${settings.subdomain}`, '_blank');
    setIsTestingSubdomain(false);
  };
  
  // New function to test using organization ID directly
  const handleTestByOrgId = () => {
    if (!organizationId) return;
    window.open(`/preview-domain/${organizationId}`, '_blank');
  };
  
  const copySubdomainPreviewUrl = () => {
    if (!settings.subdomain) return;
    
    const url = `${window.location.origin}/preview-domain/${settings.subdomain}`;
    navigator.clipboard.writeText(url);
    
    toast({
      title: "URL Copied",
      description: "Subdomain preview URL copied to clipboard",
    });
  };
  
  const copyOrgIdPreviewUrl = () => {
    if (!organizationId) return;
    
    const url = `${window.location.origin}/preview-domain/${organizationId}`;
    navigator.clipboard.writeText(url);
    
    toast({
      title: "URL Copied",
      description: "Organization ID preview URL copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Generate preview URL for the subdomain
  const previewUrlBySubdomain = settings.subdomain ? `/preview-domain/${settings.subdomain}` : null;
  const previewUrlByOrgId = organizationId ? `/preview-domain/${organizationId}` : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Settings</CardTitle>
        <CardDescription>Configure organization preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
            <TabsTrigger value="website" className="flex-1">Website</TabsTrigger>
            <TabsTrigger value="advanced" className="flex-1">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <div>
              <Label htmlFor="name">Organization Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={settings.name} 
                onChange={handleChange}
                className="mt-1" 
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={settings.description || ''} 
                onChange={handleChange}
                className="mt-1" 
                rows={3}
                placeholder="Brief description of your organization"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="website" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="website_enabled" className="text-base">Website Enabled</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable your organization's website
                </p>
              </div>
              <Switch 
                id="website_enabled"
                checked={settings.website_enabled}
                onCheckedChange={handleToggleChange}
              />
            </div>
            
            <div>
              <Label htmlFor="subdomain">Subdomain</Label>
              <div className="flex items-center mt-1">
                <Input 
                  id="subdomain" 
                  name="subdomain" 
                  value={settings.subdomain || ''} 
                  onChange={handleChange}
                  placeholder="your-church"
                />
                <span className="ml-2 text-muted-foreground">.church-os.com</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This will be your website address
              </p>
              
              {settings.subdomain && (
                <div className="mt-3 flex flex-col gap-2">
                  <Alert className="bg-blue-50 border-blue-200">
                    <Globe className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-blue-700">
                      Your site will be available at: <span className="font-semibold">{settings.subdomain}.church-os.com</span>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleTestSubdomain}
                      disabled={isTestingSubdomain || !settings.subdomain}
                    >
                      {isTestingSubdomain ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ExternalLink className="mr-2 h-4 w-4" />
                      )}
                      Test by Subdomain
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copySubdomainPreviewUrl}
                      disabled={!settings.subdomain}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy URL
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="border-t pt-4 mt-6">
              <h3 className="text-sm font-medium mb-2">Alternative Testing Options</h3>
              <p className="text-xs text-muted-foreground mb-3">
                You can also test your site using your organization ID directly
              </p>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestByOrgId}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Test by Organization ID
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyOrgIdPreviewUrl}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Org ID URL
                </Button>
              </div>
              
              {previewUrlByOrgId && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <p>Organization ID URL: <code className="bg-muted px-1 rounded">{window.location.origin}{previewUrlByOrgId}</code></p>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <Label htmlFor="custom_domain">Custom Domain</Label>
              <Input 
                id="custom_domain" 
                name="custom_domain" 
                value={settings.custom_domain || ''} 
                onChange={handleChange}
                placeholder="www.yourchurch.org"
                className="mt-1" 
              />
              <p className="text-xs text-muted-foreground mt-1">
                Connect your own domain (requires premium plan)
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <h4 className="font-medium">Danger Zone</h4>
              <p className="text-sm text-muted-foreground mb-3">
                These actions cannot be undone
              </p>
              <Button 
                variant="destructive" 
                size="sm" 
                disabled
                onClick={() => {
                  if (showComingSoonToast) showComingSoonToast();
                }}
              >
                Delete Organization
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSaveSettings} 
          disabled={isSaving}
          className="ml-auto"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Saving...
            </>
          ) : 'Save Settings'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OrganizationSettingsForm;
