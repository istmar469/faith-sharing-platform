
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CopyIcon, CheckIcon, ExternalLink, Globe, Info, Server, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DnsRecord {
  type: string;
  name: string;
  value: string;
  ttl?: string;
  priority?: string;
  description: string;
}

const DnsConfigurationGuide = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  // Sample DNS records for different providers
  const subdomainRecords: DnsRecord[] = [
    {
      type: "CNAME",
      name: "yoursubdomain",
      value: "church-os.com",
      ttl: "3600",
      description: "Points your subdomain directly to Church-OS"
    }
  ];

  const customDomainRecords: DnsRecord[] = [
    {
      type: "CNAME",
      name: "www",
      value: "church-os.com",
      ttl: "3600",
      description: "Points www.yourdomain.com to Church-OS"
    },
    {
      type: "A",
      name: "@",
      value: "76.76.21.21",
      description: "Points your root domain to Church-OS DNS servers"
    }
  ];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
    
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">DNS Configuration Guide</CardTitle>
        <CardDescription>
          Learn how to properly connect your domain to Church-OS
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-800">Important Information</AlertTitle>
          <AlertDescription className="text-blue-700">
            <p className="mb-2">
              Church-OS supports two domain configurations:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Free Subdomain:</strong> yourchurch.church-os.com</li>
              <li><strong>Custom Domain:</strong> yourchurch.org or www.yourchurch.org</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="subdomain" className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="subdomain">Free Subdomain</TabsTrigger>
            <TabsTrigger value="custom">Custom Domain</TabsTrigger>
          </TabsList>

          <TabsContent value="subdomain" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">How Free Subdomains Work</h3>
              <p className="text-sm text-gray-600">
                Free subdomains (yourchurch.church-os.com) are the easiest to set up as they don't require any DNS configuration. 
                Simply enter your desired subdomain in your organization settings.
              </p>

              <div className="flex items-center gap-2 mt-4">
                <Server className="h-5 w-5 text-indigo-600" />
                <span className="font-medium">Technical Details</span>
              </div>
              <p className="text-sm text-gray-600">
                When users visit yourchurch.church-os.com, our application:
              </p>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1 ml-4">
                <li>Extracts "yourchurch" from the domain</li>
                <li>Looks up the organization with this subdomain in our database</li>
                <li>Serves the correct website content for that organization</li>
              </ol>

              <Alert className="mt-4 bg-amber-50 border-amber-200">
                <AlertDescription className="text-amber-700">
                  <strong>Note:</strong> Your chosen subdomain must be unique across all Church-OS organizations. 
                  If your preferred name is taken, you'll need to choose another.
                </AlertDescription>
              </Alert>
            </div>

            <div className="border rounded-md p-4">
              <h4 className="text-md font-medium mb-2">Testing Your Subdomain</h4>
              <p className="text-sm text-gray-600 mb-4">
                After setting up your subdomain in organization settings, you can test it by visiting:
              </p>
              <div className="bg-gray-100 p-3 rounded flex items-center justify-between">
                <code className="text-sm">https://<span className="font-bold">yoursubdomain</span>.church-os.com</code>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard("https://yoursubdomain.church-os.com", "Subdomain URL")}
                  className="h-8"
                >
                  {copied === "Subdomain URL" ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Setting Up Your Custom Domain</h3>
              <p className="text-sm text-gray-600">
                Using your own domain (yourchurch.org) requires configuration with your DNS provider.
                Follow the steps below to correctly connect your domain to Church-OS.
              </p>

              <div className="flex items-center gap-2 mt-4">
                <Globe className="h-5 w-5 text-indigo-600" />
                <span className="font-medium">Step 1: Configure DNS Records</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Log in to your domain registrar (GoDaddy, Namecheap, etc.) and add these DNS records:
              </p>

              <div className="border rounded-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Value</th>
                        <th className="px-4 py-2 text-left">TTL</th>
                        <th className="px-4 py-2 text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {customDomainRecords.map((record, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono">{record.type}</td>
                          <td className="px-4 py-3 font-mono">{record.name}</td>
                          <td className="px-4 py-3 font-mono">
                            <div className="flex items-center gap-1">
                              {record.value}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => copyToClipboard(record.value, `${record.type}-${i}`)}
                              >
                                {copied === `${record.type}-${i}` ? <CheckIcon className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
                              </Button>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono">{record.ttl || "Auto"}</td>
                          <td className="px-4 py-3">{record.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Database className="h-5 w-5 text-indigo-600" />
                <span className="font-medium">Step 2: Add Domain in Church-OS</span>
              </div>
              <p className="text-sm text-gray-600">
                Enter your custom domain in your organization settings. This tells Church-OS to recognize and serve your website when users visit your domain.
              </p>

              <Alert className="mt-4">
                <AlertDescription>
                  <strong>Important:</strong> DNS changes can take up to 48 hours to propagate worldwide, though they often take effect within a few hours.
                </AlertDescription>
              </Alert>
            </div>

            <div className="border rounded-md p-4">
              <h4 className="text-md font-medium mb-2">Troubleshooting Custom Domains</h4>
              <p className="text-sm text-gray-600 mb-2">
                If your custom domain isn't working:
              </p>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2 ml-4">
                <li>Verify DNS records are correctly set up with your registrar</li>
                <li>Ensure you've added the exact same domain in Church-OS settings</li>
                <li>Check if your domain registrar offers a DNS propagation checker</li>
                <li>Try using a different browser or clearing your cache</li>
              </ol>
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-gray-50 p-4 rounded-md border mt-6">
          <h3 className="text-lg font-medium mb-2">How Church-OS Domain Routing Works</h3>
          <p className="text-sm text-gray-600 mb-4">
            Understanding how our domain routing works can help you troubleshoot issues:
          </p>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
              <div>
                <h4 className="font-medium">Domain Detection</h4>
                <p className="text-sm text-gray-600">
                  When a visitor comes to your site, Church-OS extracts the subdomain or checks the custom domain.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
              <div>
                <h4 className="font-medium">Organization Lookup</h4>
                <p className="text-sm text-gray-600">
                  The system looks up which organization is associated with that domain in our database.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
              <div>
                <h4 className="font-medium">Content Serving</h4>
                <p className="text-sm text-gray-600">
                  If found and website functionality is enabled, Church-OS serves the organization's homepage and website content.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
              <div>
                <h4 className="font-medium">Error Handling</h4>
                <p className="text-sm text-gray-600">
                  If the domain isn't found or website is disabled, an appropriate error page is shown.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline">
          Back to Settings
        </Button>
        <Button variant="secondary" onClick={() => window.open("/diagnostic", "_blank")}>
          Run DNS Diagnostic
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DnsConfigurationGuide;
