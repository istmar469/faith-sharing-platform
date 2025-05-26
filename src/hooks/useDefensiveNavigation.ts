
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import { validateRoute, getContextAwareRoute, debugRoute } from '@/utils/routing/routeValidation';

export const useDefensiveNavigation = () => {
  const navigate = useNavigate();
  const { isSubdomainAccess, organizationId } = useTenantContext();

  const navigateWithValidation = useCallback((route: string, options?: { replace?: boolean }) => {
    const context = {
      isSubdomainAccess,
      organizationId,
      pathname: window.location.pathname
    };

    // Validate the route
    const isValid = validateRoute(route, context);
    if (!isValid) {
      console.error('Invalid route navigation attempted:', route, 'Context:', context);
      return;
    }

    // Get context-aware route
    const finalRoute = getContextAwareRoute(route, context);

    // Debug in development
    debugRoute(route, finalRoute, context);

    // Navigate
    navigate(finalRoute, options);
  }, [navigate, isSubdomainAccess, organizationId]);

  return { navigateWithValidation };
};
