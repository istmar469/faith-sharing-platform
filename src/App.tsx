
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import app pages
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import DiagnosticPage from './pages/DiagnosticPage';

// Import tenant dashboard components
import TenantDashboard from './components/dashboard/TenantDashboard';
import SuperAdminDashboard from './components/dashboard/SuperAdminDashboard';

// Import settings components  
import CustomDomainSettings from './components/settings/CustomDomainSettings';
import SubscriptionTestPage from './components/settings/SubscriptionTestPage';
import AdminManagement from './components/settings/AdminManagement';
import OrganizationManagement from './components/settings/OrganizationManagement';
import TenantManagementSettings from './components/settings/TenantManagementSettings';
import UserOrgAssignment from './components/settings/UserOrgAssignment';

// Import page builder components
import PageBuilder from './components/pagebuilder/PageBuilder';
import DomainPreview from './components/pagebuilder/DomainPreview';

// Import routing components
import SubdomainRouter from './components/routing/SubdomainRouter';
import { OrganizationData } from './components/dashboard/types';

function App() {
  // Default empty array for organizations when used outside SuperAdminDashboard
  const emptyOrganizations: OrganizationData[] = [];
  
  return (
    <BrowserRouter>
      {/* The SubdomainRouter detects subdomains and handles routing */}
      <SubdomainRouter />
      
      <Routes>
        {/* Main routes */}
        <Route path="/" element={<Index />} />
        
        {/* Tenant dashboard routes */}
        <Route path="/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/tenant-dashboard/:organizationId" element={<TenantDashboard />} />
        
        {/* Page builder routes */}
        <Route path="/page-builder" element={<Navigate to="/dashboard" replace />} />
        <Route path="/page-builder/:pageId" element={<PageBuilder />} />
        
        {/* Domain preview routes */}
        <Route path="/preview-domain/:subdomain" element={<DomainPreview />} />
        
        {/* Settings routes */}
        <Route path="/settings/domains" element={<CustomDomainSettings />} />
        <Route path="/settings/subscription-test" element={<SubscriptionTestPage />} />
        <Route path="/settings/admin-management" element={<AdminManagement />} />
        <Route path="/settings/org-management" element={<OrganizationManagement />} />
        <Route path="/settings/tenant-management/:organizationId" element={<TenantManagementSettings />} />
        <Route path="/settings/user-org-assignment" element={<UserOrgAssignment organizations={emptyOrganizations} />} />
        
        {/* Diagnostic page */}
        <Route path="/diagnostic" element={<DiagnosticPage />} />
        
        {/* Catch all for 404s */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
