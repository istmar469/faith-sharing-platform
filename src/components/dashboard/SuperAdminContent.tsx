
import React from 'react';
import SideNav from './SideNav';
import SuperAdminHeader from './SuperAdminHeader';
import OrganizationsSearch from './OrganizationsSearch';
import OrganizationDataDisplay from './OrganizationDataDisplay';
import { OrganizationData } from './types';

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
  onRefresh
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
        />
      </div>
    </div>
  );
};

export default SuperAdminContent;
