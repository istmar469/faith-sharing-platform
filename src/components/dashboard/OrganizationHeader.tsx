
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Globe, Settings } from 'lucide-react';
import { OrganizationData } from './types';

type OrganizationHeaderProps = {
  organization: OrganizationData;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleWebsiteToggle: () => Promise<void>;
  showComingSoonToast: () => void;
};

const OrganizationHeader: React.FC<OrganizationHeaderProps> = ({
  organization,
  activeTab,
  setActiveTab,
  handleWebsiteToggle,
  showComingSoonToast
}) => {
  const navigate = useNavigate();
  
  return (
    <header className="bg-white shadow-sm">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => navigate('/super-admin')}
                className="flex items-center text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {organization.subdomain ? `${organization.subdomain}.church-os.com` : 'No domain set'}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant={organization.website_enabled ? "default" : "outline"}
              onClick={handleWebsiteToggle}
            >
              <Globe className="h-4 w-4 mr-2" />
              {organization.website_enabled ? "Website Enabled" : "Enable Website"}
            </Button>
            <Button variant="outline" onClick={showComingSoonToast}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
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
