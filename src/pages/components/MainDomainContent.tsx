
import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingPage from '@/components/landing/LandingPage';
import AdminBar from '@/components/admin/AdminBar';
import FloatingAdminButton from '@/components/admin/FloatingAdminButton';
import FloatingLoginButton from '@/components/admin/FloatingLoginButton';
import LoginDialog from '@/components/auth/LoginDialog';

interface MainDomainContentProps {
  isAuthenticated: boolean;
  adminBarDismissed: boolean;
  shouldRedirect: boolean;
  showLoginDialog: boolean;
  setShowLoginDialog: (show: boolean) => void;
  onDismissAdminBar: () => void;
  onShowAdminBar: () => void;
}

const MainDomainContent: React.FC<MainDomainContentProps> = ({
  isAuthenticated,
  adminBarDismissed,
  shouldRedirect,
  showLoginDialog,
  setShowLoginDialog,
  onDismissAdminBar,
  onShowAdminBar
}) => {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Admin bar for authenticated users on root domain */}
      {isAuthenticated && !adminBarDismissed && (
        <AdminBar 
          isSubdomainAccess={false}
          onDismiss={onDismissAdminBar}
        />
      )}

      {/* Floating admin button when bar is dismissed */}
      {isAuthenticated && adminBarDismissed && (
        <FloatingAdminButton onShowAdminBar={onShowAdminBar} />
      )}

      {/* Non-authenticated users get a login button */}
      {!isAuthenticated && (
        <FloatingLoginButton onShowLogin={() => setShowLoginDialog(true)} />
      )}

      {/* Show dashboard button for authenticated users */}
      {isAuthenticated && shouldRedirect && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleGoToDashboard}
            className="bg-primary text-white px-4 py-2 rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className={`${isAuthenticated && !adminBarDismissed ? 'pt-12' : ''}`}>
        <LandingPage onShowLogin={() => setShowLoginDialog(true)} />
      </div>

      <LoginDialog isOpen={showLoginDialog} setIsOpen={setShowLoginDialog} />
    </div>
  );
};

export default MainDomainContent;
