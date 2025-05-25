import React from 'react';
import { Info } from 'lucide-react';
import { Alert } from "@/components/ui/alert";
import { isDevelopmentEnvironment } from '@/utils/domain';

interface SubdomainInfoProps {
  currentSubdomain: string;
}

const SubdomainInfo = ({ currentSubdomain }: SubdomainInfoProps) => {
  const isInDevEnvironment = isDevelopmentEnvironment();

  return (
    <Alert className="mb-6 bg-blue-50 border-blue-200">
      <div className="flex items-start">
        <Info className="h-5 w-5 text-blue-500 mt-0.5" />
        <div className="ml-2">
          <p className="font-medium text-blue-800 text-left">
            Current Details
          </p>
          <p className="text-blue-700 text-left text-sm mt-1">
            Subdomain: <span className="font-mono bg-blue-100 px-1 py-0.5 rounded">{currentSubdomain}</span><br />
            Full domain: <span className="font-mono bg-blue-100 px-1 py-0.5 rounded">{window.location.hostname}</span><br />
            Environment: <span className="font-mono bg-blue-100 px-1 py-0.5 rounded">{isInDevEnvironment ? 'Development' : 'Production'}</span>
          </p>
        </div>
      </div>
    </Alert>
  );
};

export default SubdomainInfo;
