
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
  onAuthRetry: () => void;
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
  onAuthRetry,
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
      <SideNav />
      <div className="flex-1 p-6">
        <SuperAdminHeader onSignOut={onSignOut} />
        
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
          onAuthRetry={onAuthRetry}
        />
      </div>
    </div>
  );
};

export default SuperAdminContent;
