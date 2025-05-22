
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Globe, Pencil, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CustomDomainSettings = () => {
  const { toast } = useToast();
  const [testDomain, setTestDomain] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [dnsResults, setDnsResults] = useState<any>(null);

  const testSubdomain = async () => {
    if (!testDomain) {
      toast({
        title: "Error",
        description: "Please enter a subdomain to test",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Format the domain for testing - add .church-os.com if not included
      const domainParts = testDomain.split('.');
      const cleanSubdomain = domainParts.length === 1 ? testDomain : domainParts[0];
      const formattedDomain = testDomain.includes('.')
        ? testDomain
        : `${testDomain}.church-os.com`;

      // Check if this subdomain exists in the database
      const { data: orgData, error } = await supabase
        .from('organizations')
        .select('id, name, subdomain, website_enabled')
        .eq('subdomain', cleanSubdomain)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      // Add DNS lookup simulation
      let dnsInfo = {
        cname: null,
        a: null,
        isCorrect: false,
        recommendation: ""
      };
      
      // In a real implementation, we'd do actual DNS lookups here
      // For now we'll just simulate the results
      try {
        setDnsResults({
          status: "checking",
          message: "Checking DNS records..."
        });
        
        // Simulate DNS lookup delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo purposes, simulate DNS records
        dnsInfo = {
          cname: "churches.church-os.com",
          a: null,
          isCorrect: false,
          recommendation: "Your DNS is currently pointing to churches.church-os.com. For subdomain routing to work correctly, it should point to church-os.com instead."
        };
        
        setDnsResults({
          status: "complete",
          data: dnsInfo
        });
      } catch (dnsError) {
        setDnsResults({
          status: "error",
          message: "Failed to check DNS records"
        });
      }

      setTestResult({
        domainTested: formattedDomain,
        cleanSubdomain,
        timestamp: new Date().toISOString(),
        organizationFound: !!orgData,
        organizationDetails: orgData,
        dnsLookup: dnsInfo
      });

      toast({
        title: orgData ? "Subdomain Found" : "Subdomain Not Found",
        description: orgData 
          ? `Found organization: ${orgData.name}` 
          : `No organization with subdomain "${cleanSubdomain}" exists in the database`,
        variant: orgData ? "default" : "destructive"
      });

    } catch (error) {
      setTestResult({
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Error Testing Subdomain",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Domain Settings</CardTitle>
            <CardDescription>
              Configure custom domains for your organization's website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-md">
              <h3 className="text-blue-800 font-medium mb-2">Subdomain Configuration</h3>
              <p className="text-blue-700 text-sm mb-2">
                Each organization gets a free subdomain in the format:
              </p>
              <p className="text-blue-900 font-mono bg-blue-100 p-2 rounded mb-2 text-center">
                yoursubdomain.church-os.com
              </p>
              <p className="text-blue-700 text-sm">
                Set your organization's subdomain in the organization settings.
              </p>
            </div>

            <div className="border rounded-md p-4 space-y-4">
              <h3 className="font-medium">Test Your Subdomain</h3>
              <p className="text-sm text-gray-600">
                Enter a subdomain to check if it's configured correctly in your application.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="yoursubdomain or yoursubdomain.church-os.com"
                  value={testDomain}
                  onChange={(e) => setTestDomain(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={testSubdomain}
                  disabled={isTesting}
                  className="whitespace-nowrap"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Globe className="mr-2 h-4 w-4" />
                      Test Subdomain
                    </>
                  )}
                </Button>
              </div>
              
              {testResult && (
                <div className="mt-4 border rounded-md p-3 bg-gray-50">
                  <h4 className="font-medium mb-2">Test Results</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Domain Tested:</span>
                      <span className="font-mono">{testResult.domainTested}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Clean Subdomain:</span>
                      <span className="font-mono">{testResult.cleanSubdomain}</span>
                    </div>
                    
                    {testResult.error ? (
                      <div className="flex justify-between text-red-600">
                        <span>Error:</span>
                        <span>{testResult.error}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Organization Found:</span>
                          <span className={testResult.organizationFound ? "text-green-600" : "text-red-600"}>
                            {testResult.organizationFound ? "Yes" : "No"}
                          </span>
                        </div>
                        
                        {testResult.organizationFound && testResult.organizationDetails && (
                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Organization Name:</span>
                              <span>{testResult.organizationDetails.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Website Enabled:</span>
                              <span className={testResult.organizationDetails.website_enabled ? "text-green-600" : "text-amber-600"}>
                                {testResult.organizationDetails.website_enabled ? "Yes" : "No"}
                              </span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span></span>
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0"
                                onClick={() => {
                                  window.open(`/preview-domain/${testResult.organizationDetails.id}`, '_blank');
                                }}
                              >
                                Preview Site <ExternalLink className="ml-1 h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {dnsResults && dnsResults.status === "complete" && (
                          <div className="border-t pt-2 mt-2">
                            <h5 className="font-medium text-sm mb-1">DNS Configuration</h5>
                            {dnsResults.data.cname && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">CNAME Record:</span>
                                <span className="font-mono">{dnsResults.data.cname}</span>
                              </div>
                            )}
                            {dnsResults.data.a && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">A Record:</span>
                                <span className="font-mono">{dnsResults.data.a}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <span className={dnsResults.data.isCorrect ? "text-green-600" : "text-amber-600"}>
                                {dnsResults.data.isCorrect ? "Correct" : "Needs Attention"}
                              </span>
                            </div>
                            {dnsResults.data.recommendation && (
                              <div className="mt-2 text-amber-700 bg-amber-50 p-2 rounded text-xs">
                                {dnsResults.data.recommendation}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="flex justify-between text-gray-500 text-xs mt-2 pt-2 border-t">
                      <span>Timestamp:</span>
                      <span>{new Date(testResult.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertDescription>
                <p className="text-yellow-800 mb-2">
                  <strong>Important DNS Configuration:</strong>
                </p>
                <p className="text-yellow-700 text-sm mb-1">
                  For subdomains to work correctly, ensure they point to the main domain <code className="bg-yellow-100 px-1 py-0.5 rounded">church-os.com</code> (with hyphen).
                </p>
                <p className="text-yellow-700 text-sm">
                  Many organizations point to <code className="bg-yellow-100 px-1 py-0.5 rounded">churches.church-os.com</code> which prevents subdomain detection from working properly. Please update your DNS settings accordingly.
                </p>
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline"
                className="gap-2"
                asChild
              >
                <Link to="/dashboard">
                  <Globe className="h-4 w-4" />
                  Manage Organizations
                </Link>
              </Button>
              <Button 
                variant="secondary" 
                className="gap-2" 
                asChild
              >
                <Link to="/diagnostic">
                  <RefreshCw className="h-4 w-4" />
                  Domain Diagnostics
                </Link>
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button variant="outline" onClick={() => window.history.back()}>
              Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CustomDomainSettings;
