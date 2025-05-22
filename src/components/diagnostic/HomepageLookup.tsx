
import React from 'react';
import { DiagnosticResult } from '@/hooks/useDomainDiagnostic';

interface HomepageLookupProps {
  homepageLookup: DiagnosticResult['homepageLookup'];
}

const HomepageLookup: React.FC<HomepageLookupProps> = ({ homepageLookup }) => {
  if (!homepageLookup) return null;

  return (
    <div className="border rounded-md p-3">
      <h3 className="font-medium mb-2">Homepage Lookup</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <span className="text-gray-600">Database Query:</span>
        <span>{homepageLookup.error ? 'Error' : 'Success'}</span>
        
        {homepageLookup.error && (
          <>
            <span className="text-gray-600">Error:</span>
            <span className="text-red-500">{homepageLookup.error.message}</span>
          </>
        )}
        
        {homepageLookup.data && (
          <>
            <span className="text-gray-600">Homepage Found:</span>
            <span className="text-green-500">Yes</span>
            <span className="text-gray-600">Page Title:</span>
            <span>{homepageLookup.data.title}</span>
          </>
        )}
        
        {homepageLookup.data === null && (
          <>
            <span className="text-gray-600">Homepage Found:</span>
            <span className="text-red-500">No</span>
            <span className="text-gray-600">Reason:</span>
            <span>No published homepage exists for this organization</span>
          </>
        )}
      </div>
    </div>
  );
};

export default HomepageLookup;
