
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { LayoutDashboard, Church, Users, Calendar, DollarSign, Settings } from 'lucide-react';

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ activeTab, onTabChange }) => {
  const isMobile = useIsMobile();

  return (
    <TabsList className={`grid w-full ${isMobile ? 'grid-cols-6' : 'grid-cols-6'}`}>
      <TabsTrigger value="overview" aria-label={isMobile ? "Overview" : undefined}>
        {isMobile ? <LayoutDashboard className="h-4 w-4" /> : "Overview"}
      </TabsTrigger>
      <TabsTrigger value="church" aria-label={isMobile ? "Church" : undefined}>
        {isMobile ? <Church className="h-4 w-4" /> : "Church"}
      </TabsTrigger>
      <TabsTrigger value="members" aria-label={isMobile ? "Members" : undefined}>
        {isMobile ? <Users className="h-4 w-4" /> : "Members"}
      </TabsTrigger>
      <TabsTrigger value="events" aria-label={isMobile ? "Events" : undefined}>
        {isMobile ? <Calendar className="h-4 w-4" /> : "Events"}
      </TabsTrigger>
      <TabsTrigger value="finances" aria-label={isMobile ? "Finances" : undefined}>
        {isMobile ? <DollarSign className="h-4 w-4" /> : "Finances"}
      </TabsTrigger>
      <TabsTrigger value="settings" aria-label={isMobile ? "Settings" : undefined}>
        {isMobile ? <Settings className="h-4 w-4" /> : "Settings"}
      </TabsTrigger>
    </TabsList>
  );
};

export default DashboardTabs;
