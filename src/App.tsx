
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
import TenantDashboard from '@/components/dashboard/TenantDashboard';
import SmartDashboard from '@/components/dashboard/SmartDashboard';
import ContextDebugPanel from '@/components/debug/ContextDebugPanel';

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
              <Route path="/dashboard" element={<SmartDashboard />} />
              <Route path="/tenant-dashboard" element={<TenantDashboard />} />
              <Route path="/tenant-dashboard/:organizationId" element={<TenantDashboard />} />
              <Route path="/diagnostic" element={<DiagnosticPage />} />
              <Route path="/page-builder" element={<PageBuilderPage />} />
              <Route path="/page-builder/:pageId" element={<PageBuilderPage />} />
              <Route path="/site-builder" element={<SiteBuilderPage />} />
              <Route path="/preview/:pageId" element={<PreviewPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ContextDebugPanel />
            <Toaster />
          </TenantProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
