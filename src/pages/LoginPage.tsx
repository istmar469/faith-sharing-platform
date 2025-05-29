import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import AuthForm from '@/components/auth/AuthForm';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSubdomainAccess, isContextReady } = useTenantContext();

  const handleAuthSuccess = () => {
    if (isSubdomainAccess) {
      // For subdomain access, go to subdomain dashboard
      navigate('/dashboard', { replace: true });
    } else {
      // For main domain access, go to super admin dashboard
      navigate('/dashboard?admin=true', { replace: true });
    }
  };

  if (!isContextReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSubdomainAccess ? 'Staff Login' : 'Church-OS Login'}
          </h1>
          <p className="text-gray-600">
            {isSubdomainAccess 
              ? 'Login to access admin features for this site' 
              : 'Sign in to your Church-OS account'
            }
          </p>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <AuthForm onSuccess={handleAuthSuccess} />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
