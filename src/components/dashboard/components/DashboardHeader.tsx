
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Organization } from '../hooks/useDashboardData';

interface DashboardHeaderProps {
  organization: Organization;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ organization }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="lg:hidden" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {organization.name} Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Church Management System
              </p>
            </div>
          </div>
          
          {organization.website_enabled && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Website Active
            </Badge>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
