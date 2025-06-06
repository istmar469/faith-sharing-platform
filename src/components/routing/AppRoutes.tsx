import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RootRouter from '@/components/routing/RootRouter';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DynamicPageRenderer from '@/pages/DynamicPageRenderer';
import SmartDashboardRouter from '@/components/dashboard/SmartDashboardRouter';
import PageBuilderPage from '@/pages/PageBuilderPage';
import PreviewPage from '@/pages/PreviewPage';
import SiteBuilderPage from '@/pages/SiteBuilderPage';
import SiteCustomizerPage from '@/pages/SiteCustomizerPage';
import NotFoundPage from '@/pages/NotFoundPage';
import SettingsPage from '@/pages/SettingsPage';
import ModuleManagerPage from '@/pages/settings/ModuleManagerPage';
import ProfilePage from '@/pages/ProfilePage';
import BillingPage from '@/pages/BillingPage';
import ImpersonatePage from '@/pages/ImpersonatePage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Main index route */}
      <Route path="/" element={<RootRouter />} />
      
      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<RegisterPage />} />
      
      {/* Dashboard routes */}
      <Route path="/dashboard" element={<SmartDashboardRouter />} />
      <Route path="/dashboard/:orgId" element={<SmartDashboardRouter />} />
      
      {/* Settings routes */}
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/settings/module-manager" element={<ModuleManagerPage />} />
      <Route path="/settings/*" element={<SettingsPage />} />
      
      {/* User routes */}
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/billing" element={<BillingPage />} />
      <Route path="/impersonate/:userId" element={<ImpersonatePage />} />
      
      {/* Page builder routes - MUST come before dynamic routes */}
      <Route path="/page-builder" element={<PageBuilderPage />} />
      <Route path="/page-builder/:pageId" element={<PageBuilderPage />} />
      
      {/* Preview routes */}
      <Route path="/preview/:pageId" element={<PreviewPage />} />
      <Route path="/preview/live" element={<PreviewPage />} />
      
      {/* Site management routes */}
      <Route path="/site-builder" element={<SiteBuilderPage />} />
      <Route path="/site-customizer" element={<SiteCustomizerPage />} />
      
      {/* Dynamic page routes for subdomains - MUST be last */}
      <Route path="/:slug" element={<RootRouter />} />
      
      {/* 404 fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
