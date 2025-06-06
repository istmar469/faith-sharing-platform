import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/components/auth/AuthContext';
import { TenantProvider } from '@/components/context/TenantContext';

// Pages
import AuthPage from '@/pages/AuthPage';
import PublicHomepage from '@/components/public/PublicHomepage';
import DashboardSelectPage from '@/pages/DashboardPage';
import TestUserSetupPage from '@/pages/TestUserSetupPage';

// Components
import DomainRedirect from '@/components/routing/DomainRedirect';
import SimpleRoleRouter from '@/components/routing/SimpleRoleRouter';

// Page Builder
import PageBuilderPage from '@/pages/PageBuilderPage';

function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<DomainRedirect />} />
              <Route path="/landing" element={<PublicHomepage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/signup" element={<AuthPage />} />
              
              {/* Development and testing routes */}
              <Route path="/test-user-setup" element={<TestUserSetupPage />} />
              
              {/* Dashboard routes */}
              <Route path="/dashboard-select" element={<DashboardSelectPage />} />
              <Route path="/dashboard" element={<SimpleRoleRouter />} />
              <Route path="/dashboard/:organizationId" element={<SimpleRoleRouter />} />
              
              {/* Page builder */}
              <Route path="/page-builder" element={<PageBuilderPage />} />
              <Route path="/page-builder/:pageId" element={<PageBuilderPage />} />
              
              {/* Domain redirect handler */}
              <Route path="*" element={<DomainRedirect />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </TenantProvider>
    </AuthProvider>
  );
}

export default App;
