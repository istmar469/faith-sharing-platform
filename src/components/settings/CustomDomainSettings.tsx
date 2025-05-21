
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, CheckCircle2, Globe, ArrowRight, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SideNav from '../dashboard/SideNav';
import { supabase } from "@/integrations/supabase/client";
import { Link } from 'react-router-dom';

const CustomDomainSettings = () => {
  const { toast } = useToast();
  const [domainType, setDomainType] = useState<'subdomain' | 'custom'>('subdomain');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingDomain, setExistingDomain] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  
  // Fetch organization ID and existing domain settings
  useEffect(() => {
    const fetchUserOrganization = async () => {
      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        // Get the user's organization
        const { data: organizationMember } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .single();
          
        if (!organizationMember) return;
        
        setOrganizationId(organizationMember.organization_id);
        
        // Fetch existing domain settings from organizations table
        const { data: organization } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', organizationMember.organization_id)
          .single();
          
        if (organization) {
          if (organization.subdomain) {
            setDomainType('subdomain');
            setDomain(organization.subdomain);
            setExistingDomain(`${organization.subdomain}.church-os.com`);
          } else if (organization.custom_domain) {
            setDomainType('custom');
            setDomain(organization.custom_domain);
            setExistingDomain(organization.custom_domain);
          }
        }
      } catch (error) {
        console.error('Error fetching organization:', error);
      }
    };
    
    fetchUserOrganization();
  }, []);
  
  const handleSave = async () => {
    if (!domain) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a domain name",
      });
      return;
    }
    
    if (!organizationId) {
      toast({
        variant: "destructive",
        title: "Error", 
        description: "Organization ID not found. Please refresh the page."
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Update the organization directly
      const updateData = domainType === 'subdomain' 
        ? { subdomain: domain, custom_domain: null }
        : { custom_domain: domain, subdomain: null };
      
      // Update organization
      await supabase
        .from('organizations')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', organizationId);
      
      toast({
        title: "Domain Updated",
        description: "Your domain settings have been saved",
      });
      
      // Update existing domain in the UI
      setExistingDomain(domainType === 'subdomain' ? `${domain}.church-os.com` : domain);
      
    } catch (error) {
      console.error('Error saving domain:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save domain settings. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };
  
  const previewUrl = domainType === 'subdomain' && domain 
    ? `/preview-domain/${domain}`
    : null;
  
  return (
    <div className="flex h-screen bg-gray-100">
      <SideNav />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Custom Domain Settings</h1>
          </div>
        </header>
        
        <main className="p-6">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-xl">Domain Configuration</CardTitle>
              <CardDescription>
                Configure how users will access your church website
              </CardDescription>
            </CardHeader>
            
            {existingDomain && (
              <div className="px-6 -mt-4 mb-6">
                <Alert className="bg-blue-50 border-blue-200">
                  <div className="flex justify-between w-full items-center">
                    <div>
                      <AlertTitle className="text-blue-800">Current Domain</AlertTitle>
                      <AlertDescription className="text-blue-700 font-medium">
                        {existingDomain}
                      </AlertDescription>
                    </div>
                    
                    {previewUrl && (
                      <Link to={previewUrl} className="text-blue-700 hover:text-blue-900 flex items-center">
                        Preview site <ExternalLink className="h-4 w-4 ml-1" />
                      </Link>
                    )}
                  </div>
                </Alert>
              </div>
            )}
            
            <CardContent className="space-y-6">
              <RadioGroup 
                value={domainType} 
                onValueChange={(val) => setDomainType(val as 'subdomain' | 'custom')}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="subdomain" id="subdomain" />
                  <Label htmlFor="subdomain" className="flex items-center">
                    <div className="ml-2">
                      <div className="font-medium">Subdomain (Included)</div>
                      <div className="text-sm text-gray-500">
                        Use a subdomain on church-os.com (e.g., your-church.church-os.com)
                      </div>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="flex items-center">
                    <div className="ml-2">
                      <div className="font-medium">Custom Domain</div>
                      <div className="text-sm text-gray-500">
                        Use your own custom domain (e.g., yourchurch.org)
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
              
              {domainType === 'subdomain' && (
                <div className="pt-4">
                  <Label htmlFor="subdomain-input">Your Subdomain</Label>
                  <div className="flex mt-1">
                    <Input
                      id="subdomain-input"
                      placeholder="your-church"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="rounded-r-none"
                    />
                    <div className="flex items-center rounded-r-md border border-l-0 bg-gray-50 px-3 text-gray-500">
                      .church-os.com
                    </div>
                  </div>
                  
                  {domain && (
                    <div className="mt-2 text-sm text-gray-500 flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                      Subdomain is available
                    </div>
                  )}
                </div>
              )}
              
              {domainType === 'custom' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="custom-domain">Your Custom Domain</Label>
                    <Input
                      id="custom-domain"
                      placeholder="yourchurch.org"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>DNS Configuration Required</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">
                        After saving, you'll need to add the following DNS records in your 10web.io domain control panel:
                      </p>
                      <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                        <div className="mb-1">Type: CNAME</div>
                        <div className="mb-1">Name: @</div>
                        <div>Value: churches.church-os.com</div>
                      </div>
                      <p className="mt-2 text-sm">
                        For 10web.io domains, you may also need to:
                      </p>
                      <ul className="list-disc pl-5 text-sm mt-1">
                        <li>Enable Proxy status if available</li>
                        <li>If you can't use @ for apex domains in 10web.io, consider using their website forwarding feature</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="justify-between">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSave} disabled={!domain || loading}>
                {loading ? "Saving..." : "Save Domain Settings"}
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default CustomDomainSettings;
