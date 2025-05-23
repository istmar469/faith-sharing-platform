
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext';
import { ViewModeProvider } from './components/context/ViewModeContext';
import { TenantProvider } from './components/context/TenantContext';

// Import middleware components
import SubdomainMiddleware from './middleware/SubdomainMiddleware';
import TenantContextValidator from './components/context/TenantContextValidator';

// Import app pages
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import DiagnosticPage from './pages/DiagnosticPage';
import TemplatesPage from './pages/TemplatesPage';
import PagesListPage from './pages/PagesListPage';

// Import tenant dashboard components
import TenantDashboard from './components/dashboard/TenantDashboard';
import SuperAdminDashboard from './components/dashboard/SuperAdminDashboard';

// Import settings components  
import CustomDomainSettings from './components/settings/CustomDomainSettings';
import SubscriptionTestPage from './components/settings/SubscriptionTestPage';
import AdminManagement from './components/settings/AdminManagement';
import OrganizationManagement from './components/settings/OrganizationManagement';
import TenantManagementSettings from './components/settings/TenantManagementSettings';
import UserOrganizationManager from './components/dashboard/UserOrganizationManager';

// Import page builder components
import PageBuilder from './components/pagebuilder/PageBuilder';
import DomainPreview from './components/pagebuilder/DomainPreview';

// Import routing components
import SubdomainRouter from './components/routing/SubdomainRouter';
import ConditionalRoutes from './components/routing/ConditionalRoutes';

// Import Auth components
import AuthPage from './pages/AuthPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TenantProvider>
          <ViewModeProvider>
            <SubdomainMiddleware>
              <TenantContextValidator>
                <SubdomainRouter />
                <ConditionalRoutes />
              </TenantContextValidator>
            </SubdomainMiddleware>
          </ViewModeProvider>
        </TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
