
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { TenantProvider } from '@/components/context/TenantContext';
import { AuthProvider } from '@/components/auth/AuthContext';
import AppRoutes from '@/components/routing/AppRoutes';
import SubdomainMiddleware from '@/middleware/SubdomainMiddleware';
import TenantContextValidator from '@/components/context/TenantContextValidator';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <BrowserRouter>
      <TenantProvider>
        <AuthProvider>
          <SubdomainMiddleware>
            <TenantContextValidator>
              <AppRoutes />
            </TenantContextValidator>
          </SubdomainMiddleware>
          <Toaster />
        </AuthProvider>
      </TenantProvider>
    </BrowserRouter>
  );
}

export default App;
