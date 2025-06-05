
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { TenantProvider } from '@/components/context/TenantContext';
import { AuthProvider } from '@/components/auth/AuthContext';
import AppRoutes from '@/components/routing/AppRoutes';
import SubdomainMiddleware from '@/middleware/SubdomainMiddleware';
import TenantContextValidator from '@/components/context/TenantContextValidator';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ErrorBoundary>
          <TenantProvider>
            <ErrorBoundary>
              <AuthProvider>
                <SubdomainMiddleware>
                  <TenantContextValidator>
                    <AppRoutes />
                  </TenantContextValidator>
                </SubdomainMiddleware>
                <Toaster />
              </AuthProvider>
            </ErrorBoundary>
          </TenantProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
