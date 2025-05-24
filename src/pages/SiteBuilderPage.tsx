
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import FullSiteBuilder from '@/components/sitebuilder/FullSiteBuilder';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SiteBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSubdomainAccess } = useTenantContext();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 p-2 px-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBackToHome}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-lg font-semibold">Site Builder</h1>
          <div></div>
        </div>
      </div>
      
      {/* Full Site Builder */}
      <div className="flex-1">
        <FullSiteBuilder />
      </div>
    </div>
  );
};

export default SiteBuilderPage;
