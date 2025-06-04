
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Users, Calendar, Settings, Globe, FormInput, BarChart3 } from 'lucide-react';
import PagesTab from './PagesTab';
import OrganizationOverview from './OrganizationOverview';

interface DashboardTabsProps {
  organizationId: string;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ organizationId }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7 lg:grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="website" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Website</span>
          </TabsTrigger>
          <TabsTrigger value="pages" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Pages</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Members</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Events</span>
          </TabsTrigger>
          <TabsTrigger value="forms" className="flex items-center gap-2">
            <FormInput className="h-4 w-4" />
            <span className="hidden sm:inline">Forms</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OrganizationOverview organizationId={organizationId} />
        </TabsContent>

        <TabsContent value="website" className="mt-6">
          <div className="text-center py-8">
            <Globe className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Website Management</h3>
            <p className="text-gray-600">Manage your website settings and appearance</p>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="mt-6">
          <PagesTab />
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Member Management</h3>
            <p className="text-gray-600">Manage your organization members</p>
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Event Management</h3>
            <p className="text-gray-600">Create and manage events</p>
          </div>
        </TabsContent>

        <TabsContent value="forms" className="mt-6">
          <div className="text-center py-8">
            <FormInput className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Forms</h3>
            <p className="text-gray-600">Manage contact forms and submissions</p>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="text-center py-8">
            <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Organization Settings</h3>
            <p className="text-gray-600">Configure your organization settings</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardTabs;
