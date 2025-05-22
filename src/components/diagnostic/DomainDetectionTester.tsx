
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from 'react-router-dom';
import { extractSubdomain, isDevelopmentEnvironment, isUuid } from "@/utils/domainUtils";
import { supabase } from "@/integrations/supabase/client";

/**
 * Component for testing and diagnosing subdomain detection issues
 */
const DomainDetectionTester: React.FC = () => {
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [dnsConfigStatus, setDnsConfigStatus] = useState<string | null>(null);
  const [dnsMessage, setDnsMessage] = useState<string | null>(null);

  const runDiagnostic = async () => {
    setIsRunning(true);
    const hostname = window.location.hostname;
    const result: any = {
      timestamp: new Date().toISOString(),
      hostname: hostname,
      fullUrl: window.location.href,
      isDev: isDevelopmentEnvironment(),
      detectedSubdomain: null,
      organizationLookup: null,
      domainParts: hostname.split('.'),
    };
    
    try {
      // Check if we can detect a subdomain
      const subdomain = extractSubdomain(hostname);
      result.detectedSubdomain = subdomain;
      result.isUuid = subdomain ? isUuid(subdomain) : false;
      
      // Detect DNS configuration format
      if (hostname.includes('church-os.com')) {
        if (hostname.includes('churches.church-os.com')) {
          const nestedFormat = hostname.split('.').length > 3;
          if (nestedFormat) {
            setDnsConfigStatus('Using subdomain.churches.church-os.com format');
            setDnsMessage('Your DNS is configured with the nested format - CNAME points to churches.church-os.com');
          } else {
            setDnsConfigStatus('Using churches.church-os.com format');
            setDnsMessage('You are directly on the churches.church-os.com domain');
          }
        } else {
          const directFormat = hostname.split('.').length > 2;
          if (directFormat) {
            setDnsConfigStatus('Using subdomain.church-os.com format');
            setDnsMessage('Your DNS is configured with the direct format - CNAME points to church-os.com');
          } else {
            setDnsConfigStatus('Using church-os.com format');
            setDnsMessage('You are directly on the church-os.com domain');
          }
        }
      }
      
      // If subdomain is found, check if it exists in database
      if (subdomain) {
        console.log("Diagnostic: Looking up subdomain in database:", subdomain);
        const { data, error } = await supabase
          .from('organizations')
          .select('id, name, subdomain, website_enabled')
          .eq('subdomain', subdomain)
          .maybeSingle();
          
        result.organizationLookup = { data, error };
        
        if (!error && data) {
          // Check if a homepage exists for this organization
          const { data: pageData, error: pageError } = await supabase
            .from('pages')
            .select('id, title')
            .eq('organization_id', data.id)
            .eq('is_homepage', true)
            .eq('published', true)
            .maybeSingle();
            
          result.homepageLookup = { data: pageData, error: pageError };
        }
      }
      
    } catch (err) {
      result.error = err instanceof Error ? err.message : String(err);
    } finally {
      setDiagnosticResult(result);
      setIsRunning(false);
    }
  };

  useEffect(() => {
    // Run diagnostic automatically on first load
    runDiagnostic();
  }, []);

  return (
    <Card className="max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Domain Detection Diagnostic</CardTitle>
        <CardDescription>
          This tool helps diagnose issues with subdomain detection and routing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {diagnosticResult ? (
          <div className="space-y-4">
            <div className="border rounded-md p-3">
              <h3 className="font-medium mb-2">Basic Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-600">Hostname:</span>
                <span className="font-mono">{diagnosticResult.hostname}</span>
                <span className="text-gray-600">Is Development:</span>
                <span>{diagnosticResult.isDev ? 'Yes' : 'No'}</span>
                <span className="text-gray-600">Domain Parts:</span>
                <span className="font-mono">{JSON.stringify(diagnosticResult.domainParts)}</span>
                {dnsConfigStatus && (
                  <>
                    <span className="text-gray-600">DNS Format:</span>
                    <span className="text-green-500">{dnsConfigStatus}</span>
                  </>
                )}
              </div>
              
              {dnsMessage && (
                <Alert className="mt-3 bg-blue-50 border-blue-100">
                  <AlertDescription className="text-blue-700">
                    {dnsMessage}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded">
                <p className="text-sm text-green-700">
                  <strong>Good news!</strong> Your application now supports both DNS configurations:
                  <ul className="list-disc list-inside mt-2">
                    <li>Direct format: <span className="font-mono">*.church-os.com</span> → CNAME to <span className="font-mono">church-os.com</span></li>
                    <li>Nested format: <span className="font-mono">*.church-os.com</span> → CNAME to <span className="font-mono">churches.church-os.com</span></li>
                  </ul>
                  Use whichever configuration you prefer - both work correctly.
                </p>
              </div>
            </div>
            
            <div className="border rounded-md p-3">
              <h3 className="font-medium mb-2">Subdomain Detection</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-600">Detected Subdomain:</span>
                <span className="font-mono">{diagnosticResult.detectedSubdomain || 'None'}</span>
                {diagnosticResult.detectedSubdomain && (
                  <>
                    <span className="text-gray-600">Is UUID Format:</span>
                    <span>{diagnosticResult.isUuid ? 'Yes' : 'No'}</span>
                  </>
                )}
              </div>
            </div>
            
            {diagnosticResult.organizationLookup && (
              <div className="border rounded-md p-3">
                <h3 className="font-medium mb-2">Organization Lookup</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-600">Database Query:</span>
                  <span>{diagnosticResult.organizationLookup.error ? 'Error' : 'Success'}</span>
                  
                  {diagnosticResult.organizationLookup.error && (
                    <>
                      <span className="text-gray-600">Error:</span>
                      <span className="text-red-500">{diagnosticResult.organizationLookup.error.message}</span>
                    </>
                  )}
                  
                  {diagnosticResult.organizationLookup.data && (
                    <>
                      <span className="text-gray-600">Organization Found:</span>
                      <span className="text-green-500">Yes</span>
                      <span className="text-gray-600">Organization Name:</span>
                      <span>{diagnosticResult.organizationLookup.data.name}</span>
                      <span className="text-gray-600">Website Enabled:</span>
                      <span className={diagnosticResult.organizationLookup.data.website_enabled ? "text-green-500" : "text-red-500"}>
                        {diagnosticResult.organizationLookup.data.website_enabled ? 'Yes' : 'No'}
                      </span>
                    </>
                  )}
                  
                  {diagnosticResult.organizationLookup.data === null && (
                    <>
                      <span className="text-gray-600">Organization Found:</span>
                      <span className="text-red-500">No</span>
                      <span className="text-gray-600">Reason:</span>
                      <span>No organization with this subdomain exists in database</span>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {diagnosticResult.homepageLookup && (
              <div className="border rounded-md p-3">
                <h3 className="font-medium mb-2">Homepage Lookup</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-600">Database Query:</span>
                  <span>{diagnosticResult.homepageLookup.error ? 'Error' : 'Success'}</span>
                  
                  {diagnosticResult.homepageLookup.error && (
                    <>
                      <span className="text-gray-600">Error:</span>
                      <span className="text-red-500">{diagnosticResult.homepageLookup.error.message}</span>
                    </>
                  )}
                  
                  {diagnosticResult.homepageLookup.data && (
                    <>
                      <span className="text-gray-600">Homepage Found:</span>
                      <span className="text-green-500">Yes</span>
                      <span className="text-gray-600">Page Title:</span>
                      <span>{diagnosticResult.homepageLookup.data.title}</span>
                    </>
                  )}
                  
                  {diagnosticResult.homepageLookup.data === null && (
                    <>
                      <span className="text-gray-600">Homepage Found:</span>
                      <span className="text-red-500">No</span>
                      <span className="text-gray-600">Reason:</span>
                      <span>No published homepage exists for this organization</span>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {diagnosticResult.error && (
              <Alert variant="destructive">
                <AlertDescription>
                  Error during diagnosis: {diagnosticResult.error}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="text-xs text-gray-500 mt-2">
              Diagnostic run at: {new Date(diagnosticResult.timestamp).toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            Running diagnostics...
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={runDiagnostic}
          disabled={isRunning}
        >
          {isRunning ? 'Running...' : 'Run Diagnostic Again'}
        </Button>
        <Link to="/settings/domains">
          <Button variant="secondary">
            Go to Domain Settings
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default DomainDetectionTester;
