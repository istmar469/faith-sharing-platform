
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import FullSiteBuilder from '@/components/sitebuilder/FullSiteBuilder';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FullSiteBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSubdomainAccess } = useTenantContext();

  const handleBackToDashboard = () => {
    if (isSubdomainAccess) {
      navigate('/');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 p-2 px-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleBackToDashboard}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      {/* Full Site Builder */}
      <div className="flex-1">
        <FullSiteBuilder />
      </div>
    </div>
  );
};

export default FullSiteBuilderPage;
