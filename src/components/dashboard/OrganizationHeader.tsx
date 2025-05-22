
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, ArrowLeft } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { OrganizationData } from './types';
import OrganizationSwitcher from './OrganizationSwitcher'; // Import the new component

interface OrganizationHeaderProps {
  organization: OrganizationData;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleWebsiteToggle: () => void;
  showComingSoonToast: () => void;
}

const OrganizationHeader: React.FC<OrganizationHeaderProps> = ({
  organization,
  activeTab,
  setActiveTab,
  handleWebsiteToggle,
  showComingSoonToast
}) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/dashboard');
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleBack}
              title="Back to dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            {/* Replace the static heading with the organization switcher */}
            <OrganizationSwitcher 
              currentOrganizationId={organization.id} 
              currentOrganizationName={organization.name}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Website:</span>
              <Switch 
                checked={organization.website_enabled} 
                onCheckedChange={handleWebsiteToggle}
                aria-label="Toggle website"
              />
            </div>
            
            <Button 
              variant="outline"
              onClick={() => navigate(`/page-builder/${organization.id}`)}
            >
              Edit Website
            </Button>
            
            <Button 
              variant="default"
              onClick={() => window.open(`https://${organization.subdomain}.church-os.com`, '_blank')}
            >
              Visit Website
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </header>
  );
};

export default OrganizationHeader;
