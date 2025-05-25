
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Settings, Plus, X } from 'lucide-react';
import OrgAwareLink from '@/components/routing/OrgAwareLink';
import { useTenantContext } from '@/components/context/TenantContext';

interface AdminBarProps {
  isSubdomainAccess: boolean;
  homepageData?: { id: string } | null;
  onDismiss: () => void;
}

const AdminBar: React.FC<AdminBarProps> = ({ isSubdomainAccess, homepageData, onDismiss }) => {
  const { organizationId } = useTenantContext();

  const handleDashboardClick = () => {
    if (isSubdomainAccess && organizationId) {
      // For subdomain access, redirect to main domain dashboard with organization context
      const mainDomain = window.location.hostname.includes('.church-os.com') 
        ? 'church-os.com' 
        : window.location.hostname.split('.').slice(-2).join('.');
      
      const dashboardUrl = `${window.location.protocol}//${mainDomain}/tenant-dashboard/${organizationId}`;
      window.location.href = dashboardUrl;
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-sm text-gray-700 font-medium">Staff Mode</span>
        <div className="flex items-center gap-2">
          {isSubdomainAccess ? (
            <>
              {homepageData ? (
                <OrgAwareLink to={`/page-builder/${homepageData.id}`}>
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-8"
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit Site
                  </Button>
                </OrgAwareLink>
              ) : (
                <OrgAwareLink to="/page-builder">
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-8"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Create Homepage
                  </Button>
                </OrgAwareLink>
              )}
              <Button 
                size="sm" 
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs px-3 py-1 h-8"
                onClick={handleDashboardClick}
              >
                <Settings className="mr-1 h-3 w-3" />
                Dashboard
              </Button>
            </>
          ) : (
            <OrgAwareLink to="/dashboard">
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-8"
              >
                <Settings className="mr-1 h-3 w-3" />
                Dashboard
              </Button>
            </OrgAwareLink>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
            className="text-gray-500 hover:text-gray-700 p-1 h-8 w-8"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminBar;
