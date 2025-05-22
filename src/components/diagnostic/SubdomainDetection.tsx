
import React from 'react';
import { DiagnosticResult } from '@/hooks/useDomainDiagnostic';

interface SubdomainDetectionProps {
  diagnosticResult: DiagnosticResult;
}

const SubdomainDetection: React.FC<SubdomainDetectionProps> = ({ diagnosticResult }) => {
  return (
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
  );
};

export default SubdomainDetection;
