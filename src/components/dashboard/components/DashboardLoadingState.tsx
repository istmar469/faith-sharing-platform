
import React from 'react';
import { Loader2 } from 'lucide-react';

const DashboardLoadingState: React.FC = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
        <p className="text-lg font-medium">Loading dashboard...</p>
      </div>
    </div>
  );
};

export default DashboardLoadingState;
