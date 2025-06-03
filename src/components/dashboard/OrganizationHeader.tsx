import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, ArrowLeft, FileText, Calendar, Mail, Users, Settings, LayoutDashboard } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { OrganizationData } from './types';
import OrganizationSwitcher from './OrganizationSwitcher';

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
              onClick={() => navigate(`/page-builder?organization_id=${organization.id}`)}
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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="website" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Website</span>
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Pages</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
            <TabsTrigger value="contact-forms" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Forms</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Members</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </header>
  );
};

export default OrganizationHeader;
