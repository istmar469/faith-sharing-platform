
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext';
import { ViewModeProvider } from './components/context/ViewModeContext';
import { TenantProvider } from './components/context/TenantContext';

// Import app pages
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import DiagnosticPage from './pages/DiagnosticPage';
import TemplatesPage from './pages/TemplatesPage';
import PagesListPage from './pages/PagesListPage';

// Import tenant dashboard components
import TenantDashboard from './components/dashboard/TenantDashboard';
import SuperAdminDashboard from './components/dashboard/SuperAdminDashboard';

// Import settings components  
import CustomDomainSettings from './components/settings/CustomDomainSettings';
import SubscriptionTestPage from './components/settings/SubscriptionTestPage';
import AdminManagement from './components/settings/AdminManagement';
import OrganizationManagement from './components/settings/OrganizationManagement';
import TenantManagementSettings from './components/settings/TenantManagementSettings';
import UserOrganizationManager from './components/dashboard/UserOrganizationManager';

// Import page builder components
import PageBuilder from './components/pagebuilder/PageBuilder';
import DomainPreview from './components/pagebuilder/DomainPreview';

// Import routing components
import SubdomainRouter from './components/routing/SubdomainRouter';

// Import Auth components
import AuthPage from './pages/AuthPage';

function App() {
  return (
    <BrowserRouter>
      {/* Wrap the entire app with AuthProvider */}
      <AuthProvider>
        {/* First add TenantProvider for organization context */}
        <TenantProvider>
          {/* Then wrap with ViewModeProvider, which depends on TenantContext */}
          <ViewModeProvider>
            {/* The SubdomainRouter detects subdomains and handles routing */}
            <SubdomainRouter />
            
            <Routes>
              {/* Main routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Dashboard routes - Super Admin goes to /dashboard */}
              <Route path="/dashboard" element={<SuperAdminDashboard />} />
              
              {/* Tenant dashboard routes */}
              <Route path="/tenant-dashboard" element={<TenantDashboard />} /> 
              <Route path="/tenant-dashboard/:organizationId" element={<TenantDashboard />} />
              
              {/* Templates routes */}
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/tenant-dashboard/:organizationId/templates" element={<TemplatesPage />} />
              
              {/* Pages management */}
              <Route path="/pages" element={<PagesListPage />} />
              <Route path="/tenant-dashboard/:organizationId/pages" element={<PagesListPage />} />
              
              {/* Organization-specific routes with fixed version */}
              <Route path="/tenant-dashboard/:organizationId/page-builder" element={<PageBuilder />} />
              <Route path="/tenant-dashboard/:organizationId/page-builder/:pageId" element={<PageBuilder />} />
              
              {/* Settings routes for tenant dashboard */}
              <Route path="/tenant-dashboard/:organizationId/settings/domains" element={<CustomDomainSettings />} />
              <Route path="/tenant-dashboard/:organizationId/settings/tenant" element={<TenantManagementSettings />} />
              <Route path="/tenant-dashboard/:organizationId/settings/sermon" element={<CustomDomainSettings />} />
              <Route path="/tenant-dashboard/:organizationId/settings/donations" element={<CustomDomainSettings />} />
              <Route path="/tenant-dashboard/:organizationId/settings/streaming" element={<CustomDomainSettings />} />
              <Route path="/tenant-dashboard/:organizationId/settings/socials" element={<CustomDomainSettings />} />
              
              {/* Live streaming and communication routes */}
              <Route path="/tenant-dashboard/:organizationId/livestream" element={<CustomDomainSettings />} />
              <Route path="/tenant-dashboard/:organizationId/communication" element={<CustomDomainSettings />} />
              <Route path="/tenant-dashboard/:organizationId/activity" element={<CustomDomainSettings />} />
              <Route path="/tenant-dashboard/:organizationId/settings/subscription" element={<CustomDomainSettings />} />
              
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
              <Route path="/settings/user-org-assignment" element={<UserOrganizationManager isSuperAdmin={true} />} />
              
              {/* Diagnostic page */}
              <Route path="/diagnostic" element={<DiagnosticPage />} />
              
              {/* Catch all for 404s */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ViewModeProvider>
        </TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
