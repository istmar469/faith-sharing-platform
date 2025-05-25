
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { TenantProvider } from '@/components/context/TenantContext';
import Index from './pages/Index';
import AuthPage from './pages/AuthPage';
import DiagnosticPage from './pages/DiagnosticPage';
import NotFound from './pages/NotFound';
import PageBuilderPage from './pages/PageBuilderPage';
import PreviewPage from './pages/PreviewPage';
import SiteBuilderPage from './pages/SiteBuilderPage';
import SubscriptionPage from './pages/SubscriptionPage';
import DonationSetupPage from './pages/DonationSetupPage';
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
          <TenantProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/donations/setup" element={<DonationSetupPage />} />
              <Route path="/page-builder" element={<PageBuilderPage />} />
              <Route path="/site-builder" element={<SiteBuilderPage />} />
              <Route path="/preview/:pageId" element={<PreviewPage />} />
              <Route path="/diagnostic" element={<DiagnosticPage />} />
              <Route path="/settings/module-manager" element={<ModuleManagerPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TenantProvider>
        </SessionContextProvider>
      </Router>
    </div>
  );
}

export default App;
