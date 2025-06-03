
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DynamicPageRenderer from '@/pages/DynamicPageRenderer';
import SubdomainDashboard from '@/components/dashboard/SubdomainDashboard';
import NotFoundPage from '@/pages/NotFoundPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Main index route */}
      <Route path="/" element={<Index />} />
      
      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<RegisterPage />} />
      
      {/* Dashboard route */}
      <Route path="/dashboard" element={<SubdomainDashboard />} />
      <Route path="/dashboard/:orgId" element={<SubdomainDashboard />} />
      
      {/* Dynamic page routes for subdomains */}
      <Route path="/:slug" element={<DynamicPageRenderer />} />
      
      {/* 404 fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
