
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DiagnosticResult } from '@/hooks/useDomainDiagnostic';
import { InfoIcon, AlertCircle, CloudCog } from 'lucide-react';
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
      
      <Accordion type="single" collapsible className="mt-3">
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
                  <li><strong>DNS Configuration:</strong> Add your subdomain in your domain registrar or DNS provider's control panel (not Cloudflare)
                    <ul className="list-disc list-inside ml-5 mt-1">
                      <li>Create a CNAME record for your subdomain (e.g., <span className="font-mono">test-church</span>)</li>
                      <li>Point it to <span className="font-mono">church-os.com</span> (preferred) or <span className="font-mono">churches.church-os.com</span></li>
                    </ul>
                  </li>
                  <li><strong>Cloudflare Settings:</strong> If using Cloudflare DNS, ensure:
                    <ul className="list-disc list-inside ml-5 mt-1">
                      <li>Proxy status is set to "DNS only" (gray cloud) for the subdomain, not proxied (orange cloud)</li>
                      <li>SSL/TLS setting is set to "Full" or "Full (strict)" mode</li>
                      <li>No page rules or firewall rules are blocking the subdomain access</li>
                    </ul>
                  </li>
                  <li><strong>Wait for Propagation:</strong> DNS changes can take 24-48 hours to fully propagate</li>
                  <li><strong>Clear Cache:</strong> Try clearing your browser cache or using a private/incognito window</li>
                </ol>
                <p className="mt-3 text-xs italic">Note: If using Cloudflare proxying, you might need to add Page Rules to allow your subdomain to work properly with Church-OS.</p>
              </AlertDescription>
            </Alert>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default BasicInformation;
