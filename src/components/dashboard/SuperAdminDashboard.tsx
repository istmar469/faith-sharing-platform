
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideNav from './SideNav';
import OrganizationsTable from './OrganizationsTable';
import { Loader2 } from 'lucide-react';
import { useSuperAdminData } from './hooks/useSuperAdminData';
import AccessDenied from './AccessDenied';
import LoadingState from './LoadingState';
import OrganizationsSearch from './OrganizationsSearch';

/**
 * Dashboard component for super admins
 */
const SuperAdminDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Use the custom hook for super admin data
  const { 
    organizations, 
    loading, 
    error, 
    isAllowed, 
    statusChecked,
    fetchOrganizations
  } = useSuperAdminData();

  // Handle search
  const filteredOrganizations = organizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOrgClick = (orgId: string) => {
    navigate(`/tenant-dashboard/${orgId}`);
  };

  // Show loading screen until status check is complete
  if (!statusChecked) {
    return <LoadingState />;
  }
  
  // If not a super admin, show access denied
  if (!isAllowed) {
    return (
      <AccessDenied 
        message="You need to be logged in as a super admin to access this page"
        isAuthError={true}
      />
    );
  }

  return (
    <div className="flex min-h-screen">
      <SideNav />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Super Admin Dashboard</h1>
        
        <OrganizationsSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onRefresh={fetchOrganizations}
        />

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading organizations...</span>
          </div>
        ) : error ? (
          <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800">
            {error}
          </div>
        ) : (
          <OrganizationsTable 
            organizations={filteredOrganizations}
            onOrgClick={handleOrgClick}
          />
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
