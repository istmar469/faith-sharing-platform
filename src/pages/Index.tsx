
import React from 'react';
import { useTenantContext } from '@/components/context/TenantContext';
import OrgAwareLink from '@/components/routing/OrgAwareLink';

const Index = () => {
  const { isSubdomainAccess, organizationName } = useTenantContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {isSubdomainAccess ? `Welcome to ${organizationName}` : 'Church OS'}
          </h1>
          <p className="text-xl text-gray-600">
            {isSubdomainAccess 
              ? 'Your church management system' 
              : 'Complete church management and website platform'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Page Builder</h3>
            <p className="text-gray-600 mb-4">
              Create and edit your website pages with our visual editor.
            </p>
            <OrgAwareLink
              to="/page-builder"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Open Page Builder
            </OrgAwareLink>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Dashboard</h3>
            <p className="text-gray-600 mb-4">
              Access your church management dashboard.
            </p>
            <OrgAwareLink
              to="/dashboard"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Open Dashboard
            </OrgAwareLink>
          </div>
        </div>

        <div className="text-center">
          <OrgAwareLink
            to="/auth"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Login / Sign Up
          </OrgAwareLink>
        </div>
      </div>
    </div>
  );
};

export default Index;
