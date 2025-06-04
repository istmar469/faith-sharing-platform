
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DynamicPageRenderer from '@/pages/DynamicPageRenderer';
import SubdomainDashboard from '@/components/dashboard/SubdomainDashboard';
import PageBuilderPage from '@/pages/PageBuilderPage';
import SiteBuilderPage from '@/pages/SiteBuilderPage';
import SiteCustomizerPage from '@/pages/SiteCustomizerPage';
import NotFoundPage from '@/pages/NotFoundPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Main index route */}
      <Route path="/" element={<Index />} />
      
      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<RegisterPage />} />
      
      {/* Page builder routes - MUST come before dynamic routes */}
      <Route path="/page-builder" element={<PageBuilderPage />} />
      <Route path="/page-builder/:pageId" element={<PageBuilderPage />} />
      
      {/* Site management routes */}
      <Route path="/site-builder" element={<SiteBuilderPage />} />
      <Route path="/site-customizer" element={<SiteCustomizerPage />} />
      
      {/* Dashboard route */}
      <Route path="/dashboard" element={<SubdomainDashboard />} />
      <Route path="/dashboard/:orgId" element={<SubdomainDashboard />} />
      
      {/* Dynamic page routes for subdomains - MUST be last */}
      <Route path="/:slug" element={<DynamicPageRenderer />} />
      
      {/* 404 fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
