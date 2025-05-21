
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const isSubdomainError = window.location.hostname.split(".").length > 2 && 
                           !window.location.hostname.startsWith("www");
                           
  // Check if the hostname appears to be a UUID being misinterpreted as a subdomain
  const isUuidSubdomain = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    window.location.hostname.split(".")[0]
  );

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      "Hostname:",
      window.location.hostname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-center mb-6">
          {isSubdomainError ? (
            <AlertTriangle className="h-16 w-16 text-amber-500" />
          ) : (
            <h1 className="text-6xl font-bold text-gray-400">404</h1>
          )}
        </div>
        
        {isSubdomainError ? (
          <>
            <h1 className="text-2xl font-bold mb-4">
              {isUuidSubdomain ? "Invalid Subdomain Format" : "Domain Not Configured"}
            </h1>
            <p className="text-gray-600 mb-6">
              {isUuidSubdomain 
                ? "You seem to be using a UUID as a subdomain. Did you mean to use the preview feature instead?"
                : "The subdomain you're trying to access either doesn't exist or hasn't been properly configured."}
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
            <p className="text-gray-600 mb-6">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </>
        )}
        
        <div className="space-y-4">
          <Link 
            to="/" 
            className="block w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </Link>
          
          {isSubdomainError && (
            <div className="text-sm text-gray-500 pt-4 border-t border-gray-200 mt-4">
              <p>Are you trying to access a church website? Make sure:</p>
              <ul className="list-disc list-inside mt-2 text-left">
                <li>The subdomain is spelled correctly</li>
                <li>The organization has configured their domain</li>
                <li>The website feature is enabled for this organization</li>
                {isUuidSubdomain && (
                  <li>If you're using a UUID, use the preview URL format instead: <br />
                    <code className="bg-gray-100 px-1 py-0.5 text-xs rounded">/preview-domain/[UUID]</code>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
