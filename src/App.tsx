
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext';
import { TenantProvider } from './components/context/TenantContext';

// Import middleware components
import SubdomainMiddleware from './middleware/SubdomainMiddleware';

// Import routing components
import ConditionalRoutes from './components/routing/ConditionalRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TenantProvider>
          <SubdomainMiddleware>
            <ConditionalRoutes />
          </SubdomainMiddleware>
        </TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
