
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { TenantProvider } from '@/components/context/TenantContext';
import { AuthProvider } from '@/components/auth/AuthContext';
import PageBuilderPage from '@/pages/PageBuilderPage';
import SiteBuilderPage from '@/pages/SiteBuilderPage';
import PreviewPage from '@/pages/PreviewPage';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';
import DiagnosticPage from '@/pages/DiagnosticPage';
import AuthPage from '@/pages/AuthPage';
import PagesListPage from '@/pages/PagesListPage';
import TemplatesPage from '@/pages/TemplatesPage';
import TenantDashboard from '@/components/dashboard/TenantDashboard';
import DashboardRedirect from '@/components/dashboard/DashboardRedirect';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <TenantProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="/tenant-dashboard" element={<TenantDashboard />} />
              <Route path="/tenant-dashboard/:organizationId" element={<TenantDashboard />} />
              <Route path="/diagnostic" element={<DiagnosticPage />} />
              <Route path="/page-builder" element={<PageBuilderPage />} />
              <Route path="/page-builder/:pageId" element={<PageBuilderPage />} />
              <Route path="/site-builder" element={<SiteBuilderPage />} />
              <Route path="/preview/:pageId" element={<PreviewPage />} />
              <Route path="/pages" element={<PagesListPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </TenantProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
