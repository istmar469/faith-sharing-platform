
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DiagnosticResult } from '@/hooks/useDomainDiagnostic';
import { InfoIcon } from 'lucide-react';

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
    </div>
  );
};

export default BasicInformation;
