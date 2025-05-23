
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext';
import { ViewModeProvider } from './components/context/ViewModeContext';
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
          <ViewModeProvider>
            <SubdomainMiddleware>
              <ConditionalRoutes />
            </SubdomainMiddleware>
          </ViewModeProvider>
        </TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
