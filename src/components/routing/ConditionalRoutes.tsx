
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTenantContext } from '../context/TenantContext';
import { useAuth } from '@/hooks/useAuth';

// Import pages
import Index from '@/pages/Index';
import AuthPage from '@/pages/AuthPage';
import DiagnosticPage from '@/pages/DiagnosticPage';
import NotFound from '@/pages/NotFound';
import SimplePageBuilder from '@/components/pagebuilder/SimplePageBuilder';

// Import dashboard components
import TenantDashboard from '../dashboard/TenantDashboard';
import SuperAdminDashboard from '../dashboard/SuperAdminDashboard';

const ConditionalRoutes: React.FC = () => {
  const { isSubdomainAccess, organizationId, isContextReady } = useTenantContext();
  const { user, isLoading: authLoading } = useAuth();

  // Wait for context to be ready
  if (!isContextReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/diagnostic" element={<DiagnosticPage />} />
      
      {/* Direct page builder route - bypasses all middleware */}
      <Route path="/page-builder" element={<SimplePageBuilder />} />
      
      {/* Subdomain routes */}
      {isSubdomainAccess ? (
        <>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<TenantDashboard />} />
          <Route path="*" element={<NotFound />} />
        </>
      ) : (
        /* Main domain routes */
        <>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/tenant-dashboard/:organizationId/*" element={<TenantDashboard />} />
          <Route path="*" element={<NotFound />} />
        </>
      )}
    </Routes>
  );
};

export default ConditionalRoutes;
