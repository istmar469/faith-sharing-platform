
import React from 'react';
import { Loader2 } from 'lucide-react';

const OrganizationLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
        <p className="text-lg font-medium">Loading organization details...</p>
      </div>
    </div>
  );
};

export default OrganizationLoading;
