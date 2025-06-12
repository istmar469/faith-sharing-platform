import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/components/auth/AuthContext';
import { TenantProvider } from '@/components/context/TenantContext';
import { logBuildInfo } from '@/utils/simpleBuildInfo';
import { useEffect } from 'react';
import VersionDisplay from '@/components/ui/VersionDisplay';

// Pages
import AuthPage from '@/pages/AuthPage';
import DashboardSelectPage from '@/pages/DashboardPage';
import TestUserSetupPage from '@/pages/TestUserSetupPage';
import LandingPage from '@/components/landing/LandingPage';
import LoginPage from '@/components/auth/LoginPage';

// Components
import RootRouter from '@/components/routing/RootRouter';
import SimpleRoleRouter from '@/components/routing/SimpleRoleRouter';

// Page Builder
import PageBuilderPage from '@/pages/PageBuilderPage';

function App() {
  const handleShowLogin = () => {
    window.location.href = '/login';
  };

  // Log build information on app startup
  useEffect(() => {
    logBuildInfo();
  }, []);

  return (
    <AuthProvider>
      <TenantProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<RootRouter />} />
              <Route path="/landing" element={<LandingPage onShowLogin={handleShowLogin} />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/login" element={<LoginPage />} />
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
              <Route path="/page-builder/:pageId/:slug" element={<PageBuilderPage />} />
              
              {/* Dynamic page routes */}
              <Route path="*" element={<RootRouter />} />
            </Routes>
            <Toaster />
            <VersionDisplay />
          </div>
        </Router>
      </TenantProvider>
    </AuthProvider>
  );
}

export default App;
