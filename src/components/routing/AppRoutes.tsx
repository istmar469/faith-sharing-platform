
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import DynamicPageRenderer from '@/pages/DynamicPageRenderer';
import SubdomainDashboard from '@/components/dashboard/SubdomainDashboard';
import NotFoundPage from '@/pages/NotFoundPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Main index route */}
      <Route path="/" element={<Index />} />
      
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
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
