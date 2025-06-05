
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import { isMainDomain } from '@/utils/domain';
import RootRouter from './RootRouter';
import SmartDashboardRouter from '@/components/dashboard/SmartDashboardRouter';
import EnhancedLandingPage from '@/components/landing/EnhancedLandingPage';
import SignupWithSubscription from '@/components/auth/SignupWithSubscription';
import LoginDialog from '@/components/auth/LoginDialog';

const AppRoutes: React.FC = () => {
  const { isSubdomainAccess } = useTenantContext();
  const [showLogin, setShowLogin] = React.useState(false);

  // Main domain routes
  if (isMainDomain(window.location.hostname)) {
    return (
      <>
        <Routes>
          <Route path="/" element={<EnhancedLandingPage onShowLogin={() => setShowLogin(true)} />} />
          <Route path="/signup" element={<SignupWithSubscription />} />
          <Route path="/dashboard/*" element={<SmartDashboardRouter />} />
          <Route path="/*" element={<EnhancedLandingPage onShowLogin={() => setShowLogin(true)} />} />
        </Routes>
        <LoginDialog 
          isOpen={showLogin} 
          setIsOpen={setShowLogin}
          defaultTab="login"
        />
      </>
    );
  }

  // Subdomain routes
  return (
    <Routes>
      <Route path="/" element={<RootRouter />} />
      <Route path="/:slug" element={<RootRouter />} />
      <Route path="/dashboard/*" element={<SmartDashboardRouter />} />
    </Routes>
  );
};

export default AppRoutes;
