
import React from 'react';
import OrganizationSettingsForm from './settings/OrganizationSettingsForm';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserOrganizationManager from './UserOrganizationManager';
import { useTenantDashboard } from './hooks/useTenantDashboard';

type OrganizationSettingsProps = {
  organizationId: string;
  showComingSoonToast?: () => void;
};

const OrganizationSettings: React.FC<OrganizationSettingsProps> = ({ 
  organizationId,
  showComingSoonToast 
}) => {
  const { toast } = useToast();
  const { currentOrganization, isSuperAdmin } = useTenantDashboard();
  
  // Create a default toast function if none provided
  const handleComingSoonToast = showComingSoonToast || (() => {
    toast({
      title: "Coming Soon",
      description: "This feature is under development",
    });
  });
  
  if (!organizationId) {
    return (
      <div className="text-center py-8">
        <p>No organization selected</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="general">General Settings</TabsTrigger>
        <TabsTrigger value="users">User Management</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general">
        <OrganizationSettingsForm showComingSoonToast={handleComingSoonToast} />
      </TabsContent>
      
      <TabsContent value="users">
        <UserOrganizationManager 
          currentOrganization={currentOrganization}
          showComingSoonToast={handleComingSoonToast}
          isSuperAdmin={isSuperAdmin}
        />
      </TabsContent>
    </Tabs>
  );
};

export default OrganizationSettings;
