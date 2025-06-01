import React from 'react';
import { useTenantContext } from '@/components/context/TenantContext';
import { validateRoute } from '@/utils/routing/routeValidation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isMainDomain } from '@/utils/domain/domainDetectionUtils';

interface RouteProtectionProps {
  children: React.ReactNode;
  requiredContext?: 'organization' | 'auth' | 'none';
  fallbackRoute?: string;
}

const RouteProtection: React.FC<RouteProtectionProps> = ({
  children,
  requiredContext = 'none',
  fallbackRoute = '/'
}) => {
  const { isSubdomainAccess, organizationId, isContextReady } = useTenantContext();
  const navigate = useNavigate();

  // Check if we're on a main domain (root domain)
  const isRootDomain = isMainDomain(window.location.hostname);

  // Wait for context to be ready
  if (!isContextReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if required context is available
  const hasOrganizationContext = isSubdomainAccess || organizationId;
  
  // For root domains, allow access even if organization context is required
  if (requiredContext === 'organization' && !hasOrganizationContext && !isRootDomain) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <CardTitle className="text-xl font-semibold">Organization Context Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              This page requires an organization context to function properly.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate(fallbackRoute)} className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Go to Home
              </Button>
              {!isSubdomainAccess && (
                <Button 
                  onClick={() => navigate('/dashboard')} 
                  variant="outline" 
                  className="w-full"
                >
                  Select Organization
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default RouteProtection;
