
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, CheckCircle2, Globe, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SideNav from '../dashboard/SideNav';

const CustomDomainSettings = () => {
  const { toast } = useToast();
  const [domainType, setDomainType] = useState<'subdomain' | 'custom'>('subdomain');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSave = () => {
    if (!domain) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a domain name",
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Domain Updated",
        description: "Your domain settings have been saved",
      });
    }, 1500);
  };
  
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
                        After saving, you'll need to add the following DNS records with your domain provider:
                      </p>
                      <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                        <div className="mb-1">Type: CNAME</div>
                        <div className="mb-1">Name: @</div>
                        <div>Value: churches.church-os.com</div>
                      </div>
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
