
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

/**
 * Renders different route structures based on whether user is accessing via subdomain or main domain
 */
const ConditionalRoutes: React.FC = () => {
  const { isSubdomainAccess, subdomain, organizationId } = useTenantContext();
  
  console.log("ConditionalRoutes: Rendering routes for", {
    isSubdomainAccess,
    subdomain,
    orgId: organizationId,
    pathname: window.location.pathname
  });

  // Special case - redirect tenant-dashboard routes on subdomain to simple paths
  if (isSubdomainAccess && window.location.pathname.includes('/tenant-dashboard/')) {
    console.log("ConditionalRoutes: Detected tenant-dashboard route on subdomain, redirecting");
    const parts = window.location.pathname.split('/tenant-dashboard/');
    if (parts.length > 1) {
      const orgAndPath = parts[1].split('/', 2);
      if (orgAndPath.length > 1) {
        const cleanPath = '/' + orgAndPath[1];
        return <Navigate to={cleanPath} replace />;
      }
    }
    return <Navigate to="/" replace />;
  }

  if (isSubdomainAccess) {
    // Subdomain routes - simple paths without organization prefixes
    return (
      <Routes>
        {/* Subdomain root redirects to dashboard */}
        <Route path="/" element={<TenantDashboard />} />
        
        {/* Auth routes */}
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Simple subdomain routes */}
        <Route path="/dashboard" element={<TenantDashboard />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/pages" element={<PagesListPage />} />
        
        {/* Page builder routes - no organization ID needed */}
        <Route path="/page-builder" element={<PageBuilder />} />
        <Route path="/page-builder/:pageId" element={<PageBuilder />} />
        
        {/* Settings routes */}
        <Route path="/settings/domains" element={<CustomDomainSettings />} />
        <Route path="/settings/tenant" element={<TenantManagementSettings />} />
        <Route path="/settings/sermon" element={<CustomDomainSettings />} />
        <Route path="/settings/donations" element={<CustomDomainSettings />} />
        <Route path="/settings/streaming" element={<CustomDomainSettings />} />
        <Route path="/settings/socials" element={<CustomDomainSettings />} />
        <Route path="/settings/subscription" element={<CustomDomainSettings />} />
        
        {/* Communication and activity routes */}
        <Route path="/livestream" element={<CustomDomainSettings />} />
        <Route path="/communication" element={<CustomDomainSettings />} />
        <Route path="/activity" element={<CustomDomainSettings />} />
        
        {/* Diagnostic page */}
        <Route path="/diagnostic" element={<DiagnosticPage />} />
        
        {/* Catch and redirect any tenant-dashboard routes */}
        <Route path="/tenant-dashboard/*" element={<Navigate to="/" replace />} />
        
        {/* Catch all for 404s */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  // Main domain routes - with full organization paths
  return (
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
      
      {/* Page builder routes - Direct access instead of redirect */}
      <Route path="/page-builder" element={<PageBuilder />} />
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
  );
};

export default ConditionalRoutes;
