
import React from 'react';

const SubdomainInfo: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-100 p-4 rounded-md">
      <h3 className="text-blue-800 font-medium mb-2">Subdomain Configuration</h3>
      <p className="text-blue-700 text-sm mb-2">
        Each organization gets a free subdomain in the format:
      </p>
      <p className="text-blue-900 font-mono bg-blue-100 p-2 rounded mb-2 text-center">
        yoursubdomain.church-os.com
      </p>
      <p className="text-blue-700 text-sm">
        Set your organization's subdomain in the organization settings.
      </p>
    </div>
  );
};

export default SubdomainInfo;
