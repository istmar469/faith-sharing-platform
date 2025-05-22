
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Globe, RefreshCw, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface TestResult {
  domainTested: string;
  cleanSubdomain: string;
  timestamp: string;
  organizationFound: boolean;
  organizationDetails?: {
    id: string;
    name: string;
    website_enabled: boolean;
  };
  error?: string;
  dnsLookup?: {
    cname: string | null;
    a: string | null;
    isCorrect: boolean;
    recommendation: string;
  };
}

export interface DNSResult {
  status: "checking" | "complete" | "error";
  message?: string;
  data?: {
    cname: string | null;
    a: string | null;
    isCorrect: boolean;
    recommendation: string;
  };
}

const SubdomainTester: React.FC = () => {
  const { toast } = useToast();
  const [testDomain, setTestDomain] = useState('');
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [dnsResults, setDnsResults] = useState<DNSResult | null>(null);

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

      console.log("Testing subdomain:", cleanSubdomain);
      
      // Check if this subdomain exists in the database
      const { data: orgData, error } = await supabase
        .from('organizations')
        .select('id, name, subdomain, website_enabled')
        .eq('subdomain', cleanSubdomain)
        .maybeSingle();

      if (error) {
        console.error("Database lookup error:", error);
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
      console.error("Error testing subdomain:", error);
      setTestResult({
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
        domainTested: testDomain,
        cleanSubdomain: testDomain,
        organizationFound: false
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
                
                {dnsResults && dnsResults.status === "complete" && dnsResults.data && (
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
  );
};

export default SubdomainTester;
