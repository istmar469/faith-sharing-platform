
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";

const DnsConfigAlert: React.FC = () => {
  return (
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
  );
};

export default DnsConfigAlert;
