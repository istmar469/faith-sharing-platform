
import React from 'react';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useSuperAdminData } from '@/components/dashboard/hooks/useSuperAdminData';
import SuperAdminModuleManager from '@/components/dashboard/SuperAdminModuleManager';
import LoadingState from '@/components/dashboard/LoadingState';
import AccessDenied from '@/components/dashboard/AccessDenied';

const ModuleManagerPage: React.FC = () => {
  const { isAuthenticated, isCheckingAuth } = useAuthStatus();
  const { isAllowed, statusChecked } = useSuperAdminData();

  if (isCheckingAuth || !statusChecked) {
    return <LoadingState message="Checking permissions..." />;
  }

  if (!isAuthenticated) {
    return (
      <AccessDenied 
        message="You need to be logged in to access this page"
        isAuthError={true}
      />
    );
  }

  if (!isAllowed) {
    return (
      <AccessDenied 
        message="Only super administrators can access the module manager"
      />
    );
  }

  return (
    <div className="container mx-auto py-6">
      <SuperAdminModuleManager />
    </div>
  );
};

export default ModuleManagerPage;
