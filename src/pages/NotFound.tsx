
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTenantContext } from '@/components/context/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import SubdomainChecker from '@/components/notfound/SubdomainChecker';

const NotFound: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSubdomainAccess, subdomain, organizationId } = useTenantContext();
  const [isValidSubdomain, setIsValidSubdomain] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSubdomainAccess && subdomain) {
      const checkSubdomain = async () => {
        try {
          const { data, error } = await supabase
            .from('organizations')
            .select('id')
            .eq('subdomain', subdomain)
            .single();

          setIsValidSubdomain(!!data && !error);
        } catch (error) {
          setIsValidSubdomain(false);
        } finally {
          setLoading(false);
        }
      };

      checkSubdomain();
    } else {
      setLoading(false);
    }
  }, [isSubdomainAccess, subdomain]);

  const handleGoHome = () => {
    if (isSubdomainAccess) {
      // If on a subdomain, go to subdomain root
      window.location.href = '/';
    } else {
      // Check if this looks like a tenant dashboard URL that failed
      if (location.pathname.startsWith('/tenant-dashboard/')) {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    }
  };

  if (isSubdomainAccess && !loading && !isValidSubdomain) {
    return <SubdomainChecker subdomain={subdomain} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or you may not have access to it.
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleGoHome}
            className="w-full flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            {isSubdomainAccess ? 'Go to Homepage' : 'Go to Dashboard'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Current path:</strong> {location.pathname}
          </p>
          {isSubdomainAccess && (
            <p className="text-sm text-gray-600 mt-1">
              <strong>Subdomain:</strong> {subdomain}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
