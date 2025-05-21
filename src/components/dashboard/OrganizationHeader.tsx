
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Globe, Settings, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
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
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <header className="bg-white shadow-sm">
      <div className="px-3 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="flex justify-between items-center mb-3 sm:mb-0">
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate max-w-[200px] sm:max-w-none">
                {organization.name}
              </h1>
            </div>
            
            {/* Mobile menu button */}
            <div className="sm:hidden">
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[240px] sm:w-[385px]">
                  <div className="flex flex-col gap-4 py-4">
                    <Button
                      variant={organization.website_enabled ? "default" : "outline"}
                      onClick={() => {
                        handleWebsiteToggle();
                        setMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      {organization.website_enabled ? "Website Enabled" : "Enable Website"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        showComingSoonToast();
                        setMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          
          <p className="text-xs sm:text-sm text-muted-foreground truncate mb-3 sm:mb-0">
            {organization.subdomain ? `${organization.subdomain}.church-os.com` : 'No domain set'}
          </p>
          
          <div className="hidden sm:flex space-x-2">
            <Button
              variant={organization.website_enabled ? "default" : "outline"}
              onClick={handleWebsiteToggle}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{organization.website_enabled ? "Website Enabled" : "Enable Website"}</span>
              <span className="sm:hidden">{organization.website_enabled ? "Enabled" : "Enable"}</span>
            </Button>
            <Button variant="outline" onClick={showComingSoonToast} size="sm">
              <Settings className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className={cn(
          "mt-4 w-full",
          "transition-all duration-300"
        )}>
          <TabsList className="w-full sm:w-auto grid grid-cols-3">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="members" className="text-xs sm:text-sm">Members</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </header>
  );
};

export default OrganizationHeader;
