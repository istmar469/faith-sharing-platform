
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useTenantContext } from '@/components/context/TenantContext';

interface SuperAdminPanelProps {
  isSuperAdmin: boolean;
}

/**
 * A small panel that appears for super admins when they're on a subdomain
 * Provides access to the main admin dashboard without breaking subdomain context
 */
const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ isSuperAdmin }) => {
  const { isSubdomainAccess } = useTenantContext();

  // Only show if user is super admin AND accessing via subdomain
  if (!isSuperAdmin || !isSubdomainAccess) {
    return null;
  }

  const handleAdminPanelClick = () => {
    // Open admin dashboard in new tab to preserve subdomain context
    const adminUrl = `${window.location.protocol}//${window.location.hostname.split('.').slice(-2).join('.')}/dashboard`;
    window.open(adminUrl, '_blank');
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        onClick={handleAdminPanelClick}
        size="sm"
        variant="outline"
        className="bg-white/90 backdrop-blur-sm border-primary/20 text-primary hover:bg-primary/10"
      >
        <Settings className="h-4 w-4 mr-2" />
        Super Admin Panel
      </Button>
    </div>
  );
};

export default SuperAdminPanel;
