import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { TenantProvider } from './components/context/TenantContext';
import { AuthProvider } from './components/auth/AuthContext';
import ContextDebugPanel from './components/debug/ContextDebugPanel';
import DashboardPage from './pages/DashboardPage';
import OrganizationDashboardPage from './pages/OrganizationDashboard';
import SuperAdminDashboardPage from './pages/SuperAdminDashboard';
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
import Index from './pages/Index';
import PageBuilderPage from './pages/PageBuilderPage';
import PreviewPage from './pages/PreviewPage';
import TestOrganizationCheck from './components/test/TestOrganizationCheck';
import TestUserCreatorPage from './pages/TestUserCreatorPage';
import OrganizationManagementPage from './pages/OrganizationManagementPage';
import SubscriptionTestPage from './pages/SubscriptionTestPage';

function App() {
  return (
    <BrowserRouter>
      <TenantProvider>
        <AuthProvider>
          <Toaster />
          <Routes>
            {/* Domain Redirect / Root Path Handling */}
            <Route path="/" element={<Index />} />

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
            <Route path="/dashboard/:organizationId" element={<OrganizationDashboardPage />} />

            {/* Organization Management Route */}
            <Route path="/manage/organization/:organizationId" element={<OrganizationManagementPage />} />

            {/* Testing Routes */}
            <Route path="/test/subscription" element={<SubscriptionTestPage />} />
            <Route path="/test/organization-check" element={<TestOrganizationCheck />} />
            <Route path="/test/user-creator" element={<TestUserCreatorPage />} />
            
            {/* Placeholder Routes */}
            <Route path="/coming-soon" element={<ComingSoonPage />} />

            {/* Page Builder Routes */}
            <Route path="/page-builder" element={<PageBuilderPage />} />
            <Route path="/page-builder/:pageId" element={<PageBuilderPage />} />
            
            {/* Preview Routes */}
            <Route path="/preview/live" element={<PreviewPage />} />
            <Route path="/preview/:pageId" element={<PreviewPage />} />

            {/* Not Found Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          
          {/* Debug Panel - Only shows in development */}
          <ContextDebugPanel />
        </AuthProvider>
      </TenantProvider>
    </BrowserRouter>
  );
}

export default App;
