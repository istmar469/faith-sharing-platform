
import React from 'react';
import { Route } from 'react-router-dom';
import DashboardPage from '@/pages/DashboardPage';
import OrganizationDashboardPage from '@/pages/OrganizationDashboard';
import OrganizationManagementPage from '@/pages/OrganizationManagementPage';


const DashboardRoutes: React.FC = () => (
  <>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/dashboard/:organizationId" element={<OrganizationDashboardPage />} />
    
    <Route path="/manage/organization/:organizationId" element={<OrganizationManagementPage />} />
  </>
);

export default DashboardRoutes;
