import React, { useState } from 'react';
import SideNav from './SideNav';
import SuperAdminHeader from './SuperAdminHeader';
import OrganizationsSearch from './OrganizationsSearch';
import OrganizationDataDisplay from './OrganizationDataDisplay';
import SuperAdminUserRoleManager from './SuperAdminUserRoleManager';
import DomainDetectionTester from '../diagnostic/DomainDetectionTester';
import { OrganizationData } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { BarChart3, Globe, Server, Settings, ExternalLink, User } from 'lucide-react';

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
  isSuperAdmin?: boolean;
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
  onRefresh,
  isSuperAdmin = true
}) => {
  const navigate = useNavigate();
  
  // Filter organizations based on search term
  const filteredOrganizations = organizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNav isSuperAdmin={true} />
      <div className="flex-1 p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <SuperAdminHeader onSignOut={onSignOut} />
        </div>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage all organizations and system-wide settings
          </p>
        </div>
        
        <Tabs defaultValue="organizations" className="w-full mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
            <TabsTrigger value="user-roles">Super Admin Roles</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="organizations">
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
              isSuperAdmin={isSuperAdmin}
              showManagementOptions={true} 
            />
          </TabsContent>
          
          <TabsContent value="user-roles">
            <SuperAdminUserRoleManager organizations={organizations} />
          </TabsContent>
          
          <TabsContent value="diagnostics">
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Domain & Diagnostic Tools</h2>
              <p className="text-gray-600 mb-6">
                Tools for diagnosing and troubleshooting Church-OS domain configuration and application issues.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <BarChart3 className="h-5 w-5 text-primary mr-2" />
                    <h3 className="font-medium">Domain Detection Test</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Test and validate subdomain detection for organizations.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate('/diagnostic')}
                  >
                    Run Diagnostic
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <Globe className="h-5 w-5 text-primary mr-2" />
                    <h3 className="font-medium">DNS Configuration</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Learn about proper DNS setup for Church-OS domains.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate('/diagnostic?tab=dns-info')}
                  >
                    View DNS Info
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <Server className="h-5 w-5 text-primary mr-2" />
                    <h3 className="font-medium">Organization Domains</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Manage and configure organization subdomains.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate('/settings/domains')}
                  >
                    Manage Domains
                  </Button>
                </div>
              </div>
              
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-medium mb-3">Quick Domain Test</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Test domain detection directly from the dashboard:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <DomainDetectionTester />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* New Organization Management Tools Section */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Organization Management Tools</h2>
          <p className="text-gray-600 mb-6">
            Manage individual organizations with these powerful tools
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <Settings className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-medium">Tenant Settings</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Configure organization-specific settings
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigate('/settings/org-management')}
              >
                Manage Settings
              </Button>
            </div>
            
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <User className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-medium">User Assignment</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Assign users to organizations and manage roles
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigate('/settings/user-org-assignment')}
              >
                Manage Users
              </Button>
            </div>
            
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <ExternalLink className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-medium">Tenant Access</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Quickly access tenant dashboards
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-center"
                onClick={() => navigate('/settings/org-access')}
              >
                Open Access Panel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminContent;
