import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import Index from './pages/Index';
import AuthPage from './pages/AuthPage';
import DiagnosticPage from './pages/DiagnosticPage';
import NotFound from './pages/NotFound';
import SmartDashboard from './pages/SmartDashboard';
import PageBuilderPage from './pages/PageBuilderPage';
import PreviewPage from './pages/PreviewPage';
import SiteBuilderPage from './pages/SiteBuilderPage';
import OrganizationManagement from './pages/settings/OrganizationManagement';
import UserOrgAssignment from './pages/settings/UserOrgAssignment';
import CustomDomainSettings from './pages/settings/CustomDomainSettings';
import ModuleManagerPage from '@/pages/settings/ModuleManagerPage';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const supabaseClient = useSupabaseClient();
  const session = useSession();

  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <Router>
        <SessionContextProvider supabaseClient={supabaseClient} initialSession={session}>
          {/* Routes that work with or without subdomain */}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<SmartDashboard />} />
            <Route path="/page-builder" element={<PageBuilderPage />} />
            <Route path="/site-builder" element={<SiteBuilderPage />} />
            <Route path="/preview/:pageId" element={<PreviewPage />} />
            <Route path="/diagnostic" element={<DiagnosticPage />} />
            
            {/* Settings Routes */}
            <Route path="/settings/org-management" element={<OrganizationManagement />} />
            <Route path="/settings/user-org-assignment" element={<UserOrgAssignment />} />
            <Route path="/settings/domains" element={<CustomDomainSettings />} />
            <Route path="/settings/module-manager" element={<ModuleManagerPage />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SessionContextProvider>
      </Router>
    </div>
  );
}

export default App;
