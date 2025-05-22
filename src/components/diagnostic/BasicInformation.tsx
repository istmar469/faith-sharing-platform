
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DiagnosticResult } from '@/hooks/useDomainDiagnostic';
import { InfoIcon, AlertCircle, CloudCog, Globe, Shield, Database } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface BasicInformationProps {
  diagnosticResult: DiagnosticResult;
  dnsConfigStatus: string | null;
  dnsMessage: string | null;
}

const BasicInformation: React.FC<BasicInformationProps> = ({
  diagnosticResult,
  dnsConfigStatus,
  dnsMessage
}) => {
  return (
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
        </p>
      </div>
      
      <Alert className="mt-3 bg-amber-50 border-amber-100">
        <InfoIcon className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-amber-700">
          <p className="font-medium">How to Register a Subdomain:</p>
          <ol className="list-decimal list-inside mt-1 ml-1 space-y-1">
            <li>Each organization must have a unique subdomain set in the database</li>
            <li>The website_enabled flag must be set to true for the organization</li>
            <li>Your DNS records must point correctly to church-os.com</li>
          </ol>
        </AlertDescription>
      </Alert>
      
      <Accordion type="multiple" className="mt-3">
        <AccordionItem value="cloudflare">
          <AccordionTrigger className="py-2 text-sm font-medium flex bg-red-50 text-red-800 px-3 rounded-t border border-red-100">
            <CloudCog className="h-4 w-4 mr-2" /> Cloudflare Troubleshooting
          </AccordionTrigger>
          <AccordionContent className="border border-t-0 border-red-100 rounded-b bg-white p-3">
            <Alert className="bg-white border-0 p-0">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-gray-700 text-sm">
                <p className="font-medium mb-2">If Cloudflare is blocking your subdomain access:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>DNS Configuration:</strong> Add your subdomain in Cloudflare's DNS management
                    <ul className="list-disc list-inside ml-5 mt-1">
                      <li>Create a CNAME record for your subdomain (e.g., <span className="font-mono">test-church</span>)</li>
                      <li>Point it to <span className="font-mono">church-os.com</span> (preferred) or <span className="font-mono">churches.church-os.com</span></li>
                    </ul>
                  </li>
                  <li className="font-semibold text-red-700"><strong>Proxy Status:</strong> Set to "DNS only" (gray cloud)
                    <ul className="list-disc list-inside ml-5 mt-1">
                      <li>In Cloudflare's DNS management, find your subdomain CNAME record</li>
                      <li>Look for the cloud icon next to the record (orange = proxied, gray = DNS only)</li>
                      <li>Click the orange cloud to change it to gray (DNS only)</li>
                      <li>This is a <strong>critical step</strong> - Cloudflare's proxy often blocks subdomain requests</li>
                      <li>The orange cloud (proxied) setting will likely cause 404 errors or blocking</li>
                    </ul>
                  </li>
                  <li><strong>SSL/TLS Settings:</strong> If using Cloudflare with subdomains
                    <ul className="list-disc list-inside ml-5 mt-1">
                      <li>Go to SSL/TLS section in your Cloudflare dashboard</li>
                      <li>Set the encryption mode to "Full" or "Full (strict)"</li>
                      <li>This ensures proper SSL handshakes between Cloudflare and Church-OS</li>
                    </ul>
                  </li>
                  <li><strong>Wait for Propagation:</strong> DNS changes can take 24-48 hours to fully propagate</li>
                  <li><strong>Clear Cache:</strong> Try clearing your browser cache or using a private/incognito window</li>
                </ol>
                
                <div className="mt-4 border p-3 rounded bg-gray-50">
                  <h4 className="font-medium flex items-center mb-2">
                    <Shield className="h-4 w-4 mr-1 text-amber-500" /> Common Issues with Cloudflare and Subdomains
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                    <li><strong>404 Errors:</strong> Almost always caused by Cloudflare proxying the request (orange cloud)</li>
                    <li><strong>Redirect Loops:</strong> Can occur with improper SSL settings</li>
                    <li><strong>Access Denied:</strong> May be triggered by Cloudflare security features</li>
                    <li><strong>Mixed Content:</strong> Can happen if SSL is not properly configured</li>
                  </ul>
                </div>
                
                <div className="mt-4 bg-blue-50 p-3 rounded flex items-start">
                  <Globe className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-blue-700">
                      <strong>Verify Your Configuration:</strong> After making these changes, run this diagnostic tool again or use the 
                      SubdomainTester in Settings → Domains to verify your subdomain is correctly detected.
                    </p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="database-check" className="mt-1">
          <AccordionTrigger className="py-2 text-sm font-medium flex bg-amber-50 text-amber-800 px-3 rounded-t border border-amber-100">
            <Database className="h-4 w-4 mr-2" /> Database Verification
          </AccordionTrigger>
          <AccordionContent className="border border-t-0 border-amber-100 rounded-b bg-white p-3">
            <Alert className="bg-white border-0 p-0">
              <InfoIcon className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-gray-700 text-sm">
                <p className="font-medium mb-2">Ensure subdomain is properly registered in database:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Unique Subdomain:</strong> Each organization must have a unique subdomain value in the database
                    <ul className="list-disc list-inside ml-5 mt-1">
                      <li>Check the <code>organizations</code> table for your organization</li>
                      <li>Verify the <code>subdomain</code> field is set correctly</li>
                      <li>Make sure there are no conflicting subdomains</li>
                    </ul>
                  </li>
                  <li><strong>Website Enabled:</strong> The organization must have website access enabled
                    <ul className="list-disc list-inside ml-5 mt-1">
                      <li>Verify the <code>website_enabled</code> field is set to <code>true</code></li>
                      <li>This flag controls whether the website is accessible via subdomain</li>
                    </ul>
                  </li>
                  <li><strong>Homepage Content:</strong> Check if a published homepage exists
                    <ul className="list-disc list-inside ml-5 mt-1">
                      <li>Organization needs a page with <code>is_homepage = true</code> and <code>published = true</code></li>
                      <li>Without this, visitors may see a "no content" message</li>
                    </ul>
                  </li>
                </ol>
                
                <div className="mt-4 bg-blue-50 p-3 rounded">
                  <p className="text-xs text-blue-700">
                    <strong>Quick Check:</strong> Use the "All Organizations" tab in this diagnostic tool to see all registered subdomains 
                    and their website status.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default BasicInformation;
