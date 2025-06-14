import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { extractSubdomain } from '@/utils/domain';
import { useTenantContext } from '@/components/context/TenantContext';
import LoadingState from '@/components/routing/components/LoadingState';

interface SubdomainMiddlewareProps {
  children: React.ReactNode;
}

const SubdomainMiddleware: React.FC<SubdomainMiddlewareProps> = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasValidatedRef = useRef(false);
  const currentHostnameRef = useRef<string>('');
  const location = useLocation();
  const navigate = useNavigate();
  const { setTenantContext, isSubdomainAccess } = useTenantContext();

  useEffect(() => {
    const hostname = window.location.hostname;
    
    // Only run validation once per hostname
    if (hasValidatedRef.current && currentHostnameRef.current === hostname) {
      setIsValidating(false);
      return;
    }

    const validateAndSetSubdomainContext = async () => {
      try {
        console.log("=== SubdomainMiddleware: Starting validation ===");
        const subdomain = extractSubdomain(hostname);
        const currentPath = location.pathname;

        console.log("SubdomainMiddleware: Processing", {
          hostname,
          subdomain,
          currentPath,
          timestamp: new Date().toISOString()
        });

        // CRITICAL: Don't redirect page-builder routes on refresh
        // This was causing the refresh redirect issue
        if (currentPath.startsWith('/page-builder')) {
          console.log("SubdomainMiddleware: Page builder route detected, skipping redirect logic");
        }

        // If no subdomain detected, we're on main domain
        if (!subdomain) {
          console.log("SubdomainMiddleware: No subdomain detected, main domain access");
          hasValidatedRef.current = true;
          currentHostnameRef.current = hostname;
          setIsValidating(false);
          return;
        }

        console.log("SubdomainMiddleware: Attempting to resolve subdomain to organization");
        
        // Add debugging about the current Supabase client state
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log("SubdomainMiddleware: Current auth state", {
          user: user ? { id: user.id, email: user.email } : null,
          userError: userError?.message,
          isAuthenticated: !!user
        });
        
        // Lookup organization by subdomain with detailed logging
        console.log("SubdomainMiddleware: Executing query:", {
          table: 'organizations',
          select: 'id, name, website_enabled, subdomain',
          filter: { subdomain },
          queryType: 'maybeSingle'
        });
        
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id, name, website_enabled, subdomain')
          .eq('subdomain', subdomain)
          .maybeSingle();

        console.log("SubdomainMiddleware: Raw database response", {
          subdomain,
          orgData,
          orgError: orgError ? {
            message: orgError.message,
            code: orgError.code,
            details: orgError.details,
            hint: orgError.hint
          } : null,
          queryExecuted: true,
          dataIsNull: orgData === null,
          dataIsUndefined: orgData === undefined
        });

        if (orgError) {
          console.error("SubdomainMiddleware: Database error:", orgError);
          setError(`Database error looking up subdomain "${subdomain}": ${orgError.message}`);
          setIsValidating(false);
          return;
        }

        if (!orgData) {
          console.error("SubdomainMiddleware: No organization found for subdomain:", subdomain);
          setError(`No organization found for subdomain "${subdomain}". Please check if the organization exists and has the correct subdomain configured.`);
          setIsValidating(false);
          return;
        }

        console.log("SubdomainMiddleware: Successfully found organization", {
          id: orgData.id,
          name: orgData.name,
          websiteEnabled: orgData.website_enabled,
          subdomain: orgData.subdomain
        });

        // Check if website is enabled
        if (orgData.website_enabled === false) {
          console.warn("SubdomainMiddleware: Website disabled for organization:", orgData.name);
          setError(`${orgData.name}'s website is currently disabled. Please contact the organization administrator.`);
          setIsValidating(false);
          return;
        }

        // Set tenant context with subdomain flag
        console.log("SubdomainMiddleware: Setting tenant context", {
          organizationId: orgData.id,
          organizationName: orgData.name,
          isSubdomainAccess: true
        });
        
        setTenantContext(orgData.id, orgData.name, true);

        console.log("SubdomainMiddleware: Context set successfully, marking as validated");
        hasValidatedRef.current = true;
        currentHostnameRef.current = hostname;
        setError(null);
      } catch (error) {
        console.error('SubdomainMiddleware: Unexpected error during validation:', error);
        setError(`Unexpected error during subdomain validation: ${error instanceof Error ? error.message : 'Unknown error'}`);
        hasValidatedRef.current = true;
        currentHostnameRef.current = hostname;
      } finally {
        setIsValidating(false);
      }
    };

    validateAndSetSubdomainContext();
  }, [location.pathname]); // Add pathname dependency to handle route changes

  if (isValidating) {
    return <LoadingState message="Resolving organization context..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Subdomain Resolution Error</h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
              <a
                href="https://church-os.com"
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-center"
              >
                Go to Main Site
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SubdomainMiddleware;
