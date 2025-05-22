
import React from 'react';
import { DiagnosticResult } from '@/hooks/useDomainDiagnostic';

interface OrganizationLookupProps {
  organizationLookup: DiagnosticResult['organizationLookup'];
}

const OrganizationLookup: React.FC<OrganizationLookupProps> = ({ organizationLookup }) => {
  if (!organizationLookup) return null;

  return (
    <div className="border rounded-md p-3">
      <h3 className="font-medium mb-2">Organization Lookup</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <span className="text-gray-600">Database Query:</span>
        <span>{organizationLookup.error ? 'Error' : 'Success'}</span>
        
        {organizationLookup.error && (
          <>
            <span className="text-gray-600">Error:</span>
            <span className="text-red-500">{organizationLookup.error.message}</span>
          </>
        )}
        
        {organizationLookup.data && (
          <>
            <span className="text-gray-600">Organization Found:</span>
            <span className="text-green-500">Yes</span>
            <span className="text-gray-600">Organization Name:</span>
            <span>{organizationLookup.data.name}</span>
            <span className="text-gray-600">Website Enabled:</span>
            <span className={organizationLookup.data.website_enabled ? "text-green-500" : "text-red-500"}>
              {organizationLookup.data.website_enabled ? 'Yes' : 'No'}
            </span>
          </>
        )}
        
        {organizationLookup.data === null && (
          <>
            <span className="text-gray-600">Organization Found:</span>
            <span className="text-red-500">No</span>
            <span className="text-gray-600">Reason:</span>
            <span>No organization with this subdomain exists in database</span>
          </>
        )}
      </div>
    </div>
  );
};

export default OrganizationLookup;
