
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { TenantProvider } from './components/context/TenantContext';
import { AuthProvider } from './components/auth/AuthContext';
import ContextDebugPanel from './components/debug/ContextDebugPanel';
import ComingSoonPage from './pages/ComingSoonPage';
import NotFoundPage from './pages/NotFoundPage';
import Index from './pages/Index';
import DynamicPageRenderer from './pages/DynamicPageRenderer';

// Route Groups
import AuthRoutes from './routes/AuthRoutes';
import DashboardRoutes from './routes/DashboardRoutes';
import PageBuilderRoutes from './routes/PageBuilderRoutes';
import UserRoutes from './routes/UserRoutes';
import TestRoutes from './routes/TestRoutes';

function App() {
  return (
    <BrowserRouter>
      <TenantProvider>
        <AuthProvider>
          <Toaster />
          <Routes>
            {/* Domain Redirect / Root Path Handling */}
            <Route path="/" element={<Index />} />

            {/* Auth Routes */}
            <AuthRoutes />

            {/* User Routes */}
            <UserRoutes />

            {/* Dashboard Routes */}
            <DashboardRoutes />

            {/* Testing Routes */}
            <TestRoutes />
            
            {/* Placeholder Routes */}
            <Route path="/coming-soon" element={<ComingSoonPage />} />

            {/* Page Builder Routes */}
            <PageBuilderRoutes />

            {/* Dynamic Page Routes - Must come before NotFound */}
            <Route path="/:slug" element={<DynamicPageRenderer />} />

            {/* Not Found Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          
          {/* Debug Panel - Only shows in development */}
          <ContextDebugPanel />
        </AuthProvider>
      </TenantProvider>
    </BrowserRouter>
  );
}

export default App;
