
import React from 'react';
import { ArrowLeft, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrganizationSelectorProps {
  onBackToDashboard: () => void;
}

const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({
  onBackToDashboard
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md p-6">
        <Building className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Organization Required</h1>
        <p className="text-gray-600 mb-6">
          Please select an organization from the dashboard to access the page builder.
        </p>
        <Button onClick={onBackToDashboard} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default OrganizationSelector;
