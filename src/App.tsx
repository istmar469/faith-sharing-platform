import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { TenantProvider } from './components/context/TenantContext';
import DashboardPage from './pages/DashboardPage';
import OrganizationDashboard from './pages/OrganizationDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import LoginPage from './pages/LoginPage';
import LogoutPage from './pages/LogoutPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ImpersonatePage from './pages/ImpersonatePage';
import ComingSoonPage from './pages/ComingSoonPage';
import BillingPage from './pages/BillingPage';
import NotFoundPage from './pages/NotFoundPage';
import DomainRedirect from './components/routing/DomainRedirect';
import PageBuilderPage from './pages/PageBuilderPage';

function App() {
  return (
    <BrowserRouter>
      <TenantProvider>
        <Toaster />
        <Routes>
          {/* Domain Redirect */}
          <Route path="/" element={<DomainRedirect />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* User Routes */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/impersonate/:userId" element={<ImpersonatePage />} />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/:organizationId" element={<OrganizationDashboard />} />
          <Route path="/dashboard?admin=true" element={<SuperAdminDashboard />} />

          {/* Placeholder Routes */}
          <Route path="/coming-soon" element={<ComingSoonPage />} />

          {/* Page Builder Routes */}
          <Route path="/page-builder" element={<PageBuilderPage />} />
          <Route path="/page-builder/:pageId" element={<PageBuilderPage />} />
          
          {/* Not Found Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </TenantProvider>
    </BrowserRouter>
  );
}

export default App;
