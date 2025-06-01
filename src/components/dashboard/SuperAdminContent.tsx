import React, { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import SuperAdminHeader from './SuperAdminHeader';
import OrganizationsSearch from './OrganizationsSearch';
import OrganizationDataDisplay from './OrganizationDataDisplay';
import SuperAdminUserRoleManager from './SuperAdminUserRoleManager';
import SuperAdminAnalytics from './SuperAdminAnalytics';
import DomainDetectionTester from '../diagnostic/DomainDetectionTester';
import { OrganizationData } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { BarChart3, Globe, Server, Settings, ExternalLink, User, DollarSign } from 'lucide-react';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

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
  const filteredOrganizations = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (org.subdomain && org.subdomain.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  console.log("SuperAdminContent: Rendering with isSuperAdmin:", isSuperAdmin);
  
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-white w-full">
        <DashboardSidebar 
          isSuperAdmin={true} 
          activeTab="overview"
          onTabChange={() => {}}
        />
        
        <SidebarInset className="flex-1 overflow-auto">
          <div className="flex items-center gap-3 p-4 border-b">
            <SidebarTrigger className="lg:hidden" />
            <div className="flex-1">
              <SuperAdminHeader 
                onSignOut={onSignOut}
              />
            </div>
          </div>
          
          <main className="p-6">
            <Tabs defaultValue="analytics" className="w-full mb-6">
              <TabsList className="mb-4">
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="organizations" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Organizations
                </TabsTrigger>
                <TabsTrigger value="user-roles" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Super Admin Roles
                </TabsTrigger>
                <TabsTrigger value="diagnostics" className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  Diagnostics
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="analytics">
                <SuperAdminAnalytics 
                  organizations={organizations}
                  onRefresh={onRefresh}
                />
              </TabsContent>
              
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
            
            {/* Organization Management Tools Section */}
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
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default SuperAdminContent;
