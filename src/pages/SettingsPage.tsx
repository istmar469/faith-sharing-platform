
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import OrganizationSettings from '@/components/dashboard/OrganizationSettings';

const SettingsPage: React.FC = () => {
  const location = useLocation();
  const { organizationId, isContextReady } = useTenantContext();

  if (!isContextReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  // Handle different settings routes
  if (location.pathname.includes('/settings/org-management') || location.pathname === '/settings') {
    if (!organizationId) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
            <p className="text-gray-600">No organization context available</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-6">
          <OrganizationSettings organizationId={organizationId} />
        </div>
      </div>
    );
  }

  // Default settings page
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
        <p className="text-gray-600">Application settings</p>
      </div>
    </div>
  );
};

export default SettingsPage;
