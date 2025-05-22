
import React from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import OrganizationOverview from './OrganizationOverview';
import OrganizationMembers from './OrganizationMembers';
import OrganizationSettings from './OrganizationSettings';
import { OrganizationData } from './types';

interface OrganizationTabContentProps {
  activeTab: string;
  organization: OrganizationData;
  handleWebsiteToggle: () => void;
  showComingSoonToast: () => void;
}

const OrganizationTabContent: React.FC<OrganizationTabContentProps> = ({
  activeTab,
  organization,
  handleWebsiteToggle,
  showComingSoonToast
}) => {
  return (
    <Tabs value={activeTab} className="w-full">
      <TabsContent value="overview">
        <OrganizationOverview 
          organization={organization}
          handleWebsiteToggle={handleWebsiteToggle}
        />
      </TabsContent>
      
      <TabsContent value="members">
        <OrganizationMembers showComingSoonToast={showComingSoonToast} />
      </TabsContent>
      
      <TabsContent value="settings">
        <OrganizationSettings showComingSoonToast={showComingSoonToast} />
      </TabsContent>
    </Tabs>
  );
};

export default OrganizationTabContent;
