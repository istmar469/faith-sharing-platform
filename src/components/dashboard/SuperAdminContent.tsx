
import React from 'react';
import SideNav from './SideNav';
import SuperAdminHeader from './SuperAdminHeader';
import OrganizationsSearch from './OrganizationsSearch';
import OrganizationDataDisplay from './OrganizationDataDisplay';
import SuperAdminUserRoleManager from './SuperAdminUserRoleManager';
import { OrganizationData } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SuperAdminContentProps {
  loading: boolean;
  error: string | null;
  organizations: OrganizationData[];
  onOrgClick: (orgId: string) => void;
  onRetry: () => void;
  onSignOut: () => Promise<void>;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onRefresh: () => void;
  isSuperAdmin?: boolean;
}

const SuperAdminContent: React.FC<SuperAdminContentProps> = ({
  loading,
  error,
  organizations,
  onOrgClick,
  onRetry,
  onSignOut,
  searchTerm,
  onSearchChange,
  onRefresh,
  isSuperAdmin = true
}) => {
  // Filter organizations based on search term
  const filteredOrganizations = organizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="flex min-h-screen">
      <SideNav isSuperAdmin={true} />
      <div className="flex-1 p-6">
        <SuperAdminHeader onSignOut={onSignOut} />
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage all organizations and system-wide settings
          </p>
        </div>
        
        <Tabs defaultValue="organizations" className="w-full mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
            <TabsTrigger value="user-roles">Super Admin Roles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="organizations">
            <OrganizationsSearch 
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
              onRefresh={onRefresh}
            />

            <OrganizationDataDisplay
              loading={loading}
              error={error}
              filteredOrganizations={filteredOrganizations}
              onOrgClick={onOrgClick}
              onRetry={onRetry}
              onAuthRetry={onSignOut}
              isSuperAdmin={isSuperAdmin} 
            />
          </TabsContent>
          
          <TabsContent value="user-roles">
            <SuperAdminUserRoleManager organizations={organizations} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperAdminContent;
