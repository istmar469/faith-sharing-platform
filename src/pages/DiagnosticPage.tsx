
import React, { useEffect, useState } from 'react';
import DomainDetectionTester from '@/components/diagnostic/DomainDetectionTester';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Server, Globe, ArrowLeft, LayoutDashboard, CloudCog } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const DiagnosticPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const defaultTab = searchParams.get('tab') || 'detection';
  
  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', (await supabase.auth.getUser()).data.user?.id)
          .single();
        
        if (!error && userData) {
          setIsSuperAdmin(userData.role === 'super_admin');
        }
      } catch (err) {
        console.error("Error checking super admin status:", err);
      }
    };
    
    checkSuperAdminStatus();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <header className="container mx-auto mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Church-OS Diagnostics</h1>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              size="sm"
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            
            {isSuperAdmin && (
              <Button 
                variant="secondary" 
                onClick={() => navigate('/dashboard')}
                size="sm"
                className="flex items-center"
              >
                <LayoutDashboard className="h-4 w-4 mr-1" />
                Dashboard
              </Button>
            )}
          </div>
        </div>
        <p className="text-muted-foreground">
          Use these tools to diagnose and troubleshoot issues with your Church-OS installation
        </p>
      </header>
      
      <main className="container mx-auto">
        <Tabs defaultValue={defaultTab} className="w-full mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="detection">Domain Detection</TabsTrigger>
            <TabsTrigger value="dns-info">DNS Information</TabsTrigger>
            <TabsTrigger value="cloudflare-help">Cloudflare Setup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="detection">
            <DomainDetectionTester />
          </TabsContent>
          
          <TabsContent value="dns-info">
            <Card className="max-w-2xl mx-auto my-8">
              <CardHeader>
                <CardTitle>DNS Configuration Information</CardTitle>
                <CardDescription>
                  Understanding how Church-OS handles domain routing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-blue-50 border-blue-100">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    <p className="font-medium">Good news!</p>
                    <p className="mt-1">Church-OS now supports <strong>both</strong> DNS configuration patterns for your domains:</p>
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex gap-3">
                      <Globe className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-medium">Direct Configuration</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Point your CNAME record directly to <code className="bg-gray-100 px-1 py-0.5 rounded">church-os.com</code>
                        </p>
                        <div className="bg-gray-50 p-3 rounded mt-2 border">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div className="font-medium">Type:</div>
                            <div>CNAME</div>
                            <div className="font-medium">Name/Host:</div>
                            <div>yoursubdomain</div>
                            <div className="font-medium">Points to/Value:</div>
                            <div className="font-mono">church-os.com</div>
                            <div className="font-medium">TTL:</div>
                            <div>Auto/3600</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex gap-3">
                      <Server className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-medium">Legacy Configuration</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Point your CNAME record to <code className="bg-gray-100 px-1 py-0.5 rounded">churches.church-os.com</code> (still supported)
                        </p>
                        <div className="bg-gray-50 p-3 rounded mt-2 border">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div className="font-medium">Type:</div>
                            <div>CNAME</div>
                            <div className="font-medium">Name/Host:</div>
                            <div>yoursubdomain</div>
                            <div className="font-medium">Points to/Value:</div>
                            <div className="font-mono">churches.church-os.com</div>
                            <div className="font-medium">TTL:</div>
                            <div>Auto/3600</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-green-50 border border-green-100 rounded p-4">
                  <h3 className="text-lg font-medium text-green-800 mb-2">How It Works</h3>
                  <p className="text-sm text-green-700 mb-3">
                    Church-OS now has improved domain detection that works with both configuration patterns:
                  </p>
                  <ol className="list-decimal list-inside text-sm text-green-700 space-y-2 ml-2">
                    <li>When a visitor accesses your domain, our system detects the incoming hostname</li>
                    <li>We extract the subdomain part from either <strong>subdomain.church-os.com</strong> or <strong>subdomain.churches.church-os.com</strong></li>
                    <li>The extracted subdomain is used to look up your organization in our database</li>
                    <li>If found, we serve your organization's website and content</li>
                  </ol>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium mb-2">Recommendation</h3>
                  <p className="text-sm text-gray-600">
                    While both configurations work, we recommend the direct configuration method 
                    (pointing to church-os.com) for simplicity and best performance.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="cloudflare-help">
            <Card className="max-w-2xl mx-auto my-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CloudCog className="h-5 w-5 text-blue-600 mr-2" />
                  Cloudflare Configuration Guide
                </CardTitle>
                <CardDescription>
                  Detailed instructions for setting up Church-OS subdomains with Cloudflare
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-amber-50 border-amber-100">
                  <AlertDescription className="text-amber-700">
                    <p className="font-medium">Important:</p>
                    <p className="mt-1">Most subdomain issues with Cloudflare are caused by the proxy setting. Follow this guide carefully.</p>
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-6">
                  <div className="border rounded p-4">
                    <h3 className="text-lg font-medium mb-3">Step 1: Add DNS Record</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      First, create your subdomain CNAME record in Cloudflare DNS settings:
                    </p>
                    <div className="bg-gray-50 p-4 rounded border">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="font-medium">Type:</div>
                        <div>CNAME</div>
                        <div className="font-medium">Name:</div>
                        <div>yoursubdomain (e.g., mychurch)</div>
                        <div className="font-medium">Target:</div>
                        <div className="font-mono">church-os.com</div>
                        <div className="font-medium">Proxy status:</div>
                        <div className="font-bold text-red-600">DNS only (gray cloud)</div>
                        <div className="font-medium">TTL:</div>
                        <div>Auto</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded p-4">
                    <h3 className="text-lg font-medium mb-3">Step 2: Disable Cloudflare Proxy</h3>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-2">
                          In your Cloudflare DNS settings, the cloud icon next to each record indicates 
                          whether Cloudflare is proxying the connection:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-sm ml-2">
                          <li>
                            <span className="flex items-center">
                              <span className="inline-block w-4 h-4 rounded-full bg-orange-400 mr-2"></span> 
                              <strong>Orange cloud</strong> = Proxied (will cause issues)
                            </span>
                          </li>
                          <li>
                            <span className="flex items-center">
                              <span className="inline-block w-4 h-4 rounded-full bg-gray-400 mr-2"></span> 
                              <strong>Gray cloud</strong> = DNS only (required setting)
                            </span>
                          </li>
                        </ul>
                        <p className="text-red-600 font-bold mt-3 text-sm">
                          Click the orange cloud icon to toggle it to gray (DNS only) for your subdomain record
                        </p>
                      </div>
                      <div className="md:w-1/3 flex items-center justify-center">
                        <div className="text-center">
                          <svg className="mx-auto w-20 h-20 text-orange-400" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="currentColor" />
                            <text x="50" y="57" textAnchor="middle" fill="white" fontWeight="bold" fontSize="12">Click to</text>
                            <text x="50" y="72" textAnchor="middle" fill="white" fontWeight="bold" fontSize="12">change</text>
                          </svg>
                          <div className="mt-2">
                            <svg className="mx-auto w-10 h-10 text-gray-600" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M12 22c-5.52 0-10-4.48-10-10S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm0-18c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z"/>
                              <path fill="currentColor" d="M16 16l-8-8"/>
                              <path fill="currentColor" d="M8 16l8-8"/>
                            </svg>
                          </div>
                          <svg className="mx-auto w-20 h-20 text-gray-400" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="currentColor" />
                            <text x="50" y="57" textAnchor="middle" fill="white" fontWeight="bold" fontSize="12">DNS</text>
                            <text x="50" y="72" textAnchor="middle" fill="white" fontWeight="bold" fontSize="12">only</text>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded p-4">
                    <h3 className="text-lg font-medium mb-3">Step 3: Configure SSL/TLS</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Ensure proper SSL configuration in Cloudflare:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Go to the SSL/TLS section in your Cloudflare dashboard</li>
                      <li>Set the encryption mode to "Full" or "Full (strict)"</li>
                      <li>Under Edge Certificates, ensure "Always Use HTTPS" is enabled</li>
                      <li>For Minimum TLS Version, select TLS 1.2</li>
                    </ol>
                  </div>
                  
                  <div className="border rounded p-4">
                    <h3 className="text-lg font-medium mb-3">Step 4: Wait and Test</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      After making these changes:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Allow 15-30 minutes for changes to take effect</li>
                      <li>Clear your browser cache or use an incognito window</li>
                      <li>Test accessing your subdomain (e.g., yoursubdomain.church-os.com)</li>
                      <li>Use the Domain Detection diagnostic tool to verify setup</li>
                    </ol>
                  </div>
                </div>
                
                <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h3 className="text-md font-medium text-blue-800 mb-2">Troubleshooting Common Issues</h3>
                  
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-blue-200">
                      <p className="font-medium text-sm mb-1">404 - Page Not Found</p>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        <li>Almost always caused by Cloudflare proxying (orange cloud icon)</li>
                        <li>Change CNAME record to DNS only (gray cloud)</li>
                        <li>Verify the subdomain is registered in the Church-OS database</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-blue-200">
                      <p className="font-medium text-sm mb-1">Redirect Loop</p>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        <li>Check SSL/TLS settings in Cloudflare</li>
                        <li>Ensure SSL mode is set to "Full" or "Full (strict)"</li>
                        <li>Try disabling "Always Use HTTPS" temporarily</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-blue-200">
                      <p className="font-medium text-sm mb-1">Access Denied / Cloudflare Protection</p>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        <li>Disable Cloudflare security features or firewall rules</li>
                        <li>Check for country restrictions or IP access rules</li>
                        <li>Try creating a Page Rule to bypass security for your subdomain</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DiagnosticPage;
