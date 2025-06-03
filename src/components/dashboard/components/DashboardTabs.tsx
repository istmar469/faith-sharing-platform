import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Globe, Users, Calendar, Mail, Settings, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ activeTab, onTabChange }) => {
  const isMobile = useIsMobile();

  return (
    <TabsList className={`grid w-full ${isMobile ? 'grid-cols-7' : 'grid-cols-7'}`}>
      <TabsTrigger value="overview" aria-label={isMobile ? "Overview" : undefined}>
        {isMobile ? <LayoutDashboard className="h-4 w-4" /> : "Overview"}
      </TabsTrigger>
      <TabsTrigger value="website" aria-label={isMobile ? "Website" : undefined}>
        {isMobile ? <Globe className="h-4 w-4" /> : "Website"}
      </TabsTrigger>
      <TabsTrigger value="pages" aria-label={isMobile ? "Pages" : undefined}>
        {isMobile ? <FileText className="h-4 w-4" /> : "Pages"}
      </TabsTrigger>
      <TabsTrigger value="members" aria-label={isMobile ? "Members" : undefined}>
        {isMobile ? <Users className="h-4 w-4" /> : "Members"}
      </TabsTrigger>
      <TabsTrigger value="events" aria-label={isMobile ? "Events" : undefined}>
        {isMobile ? <Calendar className="h-4 w-4" /> : "Events"}
      </TabsTrigger>
      <TabsTrigger value="contact-forms" aria-label={isMobile ? "Contact Forms" : undefined}>
        {isMobile ? <Mail className="h-4 w-4" /> : "Forms"}
      </TabsTrigger>
      <TabsTrigger value="settings" aria-label={isMobile ? "Settings" : undefined}>
        {isMobile ? <Settings className="h-4 w-4" /> : "Settings"}
      </TabsTrigger>
    </TabsList>
  );
};

export default DashboardTabs;
