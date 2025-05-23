
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTenantContext } from '../context/TenantContext';

// Import all pages and components
import Index from '../../pages/Index';
import NotFound from '../../pages/NotFound';
import DiagnosticPage from '../../pages/DiagnosticPage';
import TemplatesPage from '../../pages/TemplatesPage';
import PagesListPage from '../../pages/PagesListPage';
import TenantDashboard from '../dashboard/TenantDashboard';
import SuperAdminDashboard from '../dashboard/SuperAdminDashboard';
import CustomDomainSettings from '../settings/CustomDomainSettings';
import SubscriptionTestPage from '../settings/SubscriptionTestPage';
import AdminManagement from '../settings/AdminManagement';
import OrganizationManagement from '../settings/OrganizationManagement';
import TenantManagementSettings from '../settings/TenantManagementSettings';
import UserOrganizationManager from '../dashboard/UserOrganizationManager';
import PageBuilder from '../pagebuilder/PageBuilder';
import DomainPreview from '../pagebuilder/DomainPreview';
import AuthPage from '../../pages/AuthPage';

const ConditionalRoutes: React.FC = () => {
  const { isSubdomainAccess } = useTenantContext();

  // SUBDOMAIN ROUTING: Clean paths only
  if (isSubdomainAccess) {
    console.log("ConditionalRoutes: Rendering subdomain routes");
    return (
      <Routes>
        <Route path="/" element={<TenantDashboard />} />
        <Route path="/dashboard" element={<TenantDashboard />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/pages" element={<PagesListPage />} />
        <Route path="/page-builder" element={<PageBuilder />} />
        <Route path="/page-builder/:pageId" element={<PageBuilder />} />
        <Route path="/settings/domains" element={<CustomDomainSettings />} />
        <Route path="/settings/tenant" element={<TenantManagementSettings />} />
        <Route path="/settings/sermon" element={<CustomDomainSettings />} />
        <Route path="/settings/donations" element={<CustomDomainSettings />} />
        <Route path="/settings/streaming" element={<CustomDomainSettings />} />
        <Route path="/settings/socials" element={<CustomDomainSettings />} />
        <Route path="/settings/subscription" element={<CustomDomainSettings />} />
        <Route path="/livestream" element={<CustomDomainSettings />} />
        <Route path="/communication" element={<CustomDomainSettings />} />
        <Route path="/activity" element={<CustomDomainSettings />} />
        <Route path="/diagnostic" element={<DiagnosticPage />} />
        {/* Redirect any legacy tenant-dashboard paths */}
        <Route path="/tenant-dashboard/*" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  // MAIN DOMAIN ROUTING: Super admin and public routes only
  console.log("ConditionalRoutes: Rendering main domain routes");
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<SuperAdminDashboard />} />
      <Route path="/preview-domain/:subdomain" element={<DomainPreview />} />
      <Route path="/settings/domains" element={<CustomDomainSettings />} />
      <Route path="/settings/subscription-test" element={<SubscriptionTestPage />} />
      <Route path="/settings/admin-management" element={<AdminManagement />} />
      <Route path="/settings/org-management" element={<OrganizationManagement />} />
      <Route path="/settings/user-org-assignment" element={<UserOrganizationManager isSuperAdmin={true} />} />
      <Route path="/diagnostic" element={<DiagnosticPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default ConditionalRoutes;
