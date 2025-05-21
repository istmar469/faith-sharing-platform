
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AlertTriangle, Info, Database } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const [subdomainCheckResult, setSubdomainCheckResult] = useState<{
    exists: boolean;
    subdomain: string | null;
    org?: any;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const isSubdomainError = window.location.hostname.split(".").length > 2 && 
                         !window.location.hostname.startsWith("www");
                           
  // Check if the hostname appears to be a UUID being misinterpreted as a subdomain
  const isUuidSubdomain = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    window.location.hostname.split(".")[0]
  );
  
  // Helper function to check if we're in a development environment
  const isDevelopmentEnvironment = (): boolean => {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || 
           hostname.endsWith('lovable.dev') || 
           hostname.endsWith('lovable.app') ||
           hostname === '127.0.0.1';
  };

  // Check if the current URL is a preview URL
  const isPreviewUrl = location.pathname.startsWith('/preview-domain/');
  
  // Extract subdomain from preview URL or hostname
  const getSubdomain = (): string | null => {
    if (isPreviewUrl) {
      const parts = location.pathname.split('/');
      return parts.length > 2 ? parts[2] : null;
    } else if (isSubdomainError) {
      return window.location.hostname.split('.')[0];
    }
    return null;
  };

  const subdomain = getSubdomain();

  // Function to check if a subdomain exists in the database
  const checkSubdomainInDatabase = async (subdomain: string) => {
    setIsChecking(true);
    try {
      console.log("Checking subdomain in database:", subdomain);
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, subdomain, website_enabled')
        .eq('subdomain', subdomain)
        .maybeSingle();
        
      console.log("Database check result:", { data, error });
        
      if (error) {
        console.error("Database error:", error);
      }
      
      setSubdomainCheckResult({
        exists: !!data,
        subdomain,
        org: data
      });
    } catch (err) {
      console.error("Error checking subdomain:", err);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      "Hostname:",
      window.location.hostname,
      "Is development environment:",
      isDevelopmentEnvironment()
    );
    
    if (subdomain) {
      checkSubdomainInDatabase(subdomain);
    }
  }, [location.pathname, subdomain]);

  // Get the current subdomain if applicable
  const currentSubdomain = window.location.hostname.split('.')[0];
  const isInDevEnvironment = isDevelopmentEnvironment();

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
            
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="ml-2">
                  <p className="font-medium text-blue-800 text-left">
                    Current Details
                  </p>
                  <p className="text-blue-700 text-left text-sm mt-1">
                    Subdomain: <span className="font-mono bg-blue-100 px-1 py-0.5 rounded">{currentSubdomain}</span><br />
                    Full domain: <span className="font-mono bg-blue-100 px-1 py-0.5 rounded">{window.location.hostname}</span><br />
                    Environment: <span className="font-mono bg-blue-100 px-1 py-0.5 rounded">{isInDevEnvironment ? 'Development' : 'Production'}</span>
                  </p>
                </div>
              </div>
            </Alert>
            
            {subdomain && (
              <Alert className="mb-6 bg-yellow-50 border-yellow-200">
                <div className="flex items-start">
                  <Database className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div className="ml-2">
                    <p className="font-medium text-yellow-800 text-left">
                      Database Verification Results
                    </p>
                    {isChecking ? (
                      <p className="text-yellow-700 text-left text-sm mt-1">
                        Checking database for subdomain "{subdomain}"...
                      </p>
                    ) : subdomainCheckResult ? (
                      <div className="text-yellow-700 text-left text-sm mt-1">
                        <p>
                          Subdomain "{subdomainCheckResult.subdomain}" {subdomainCheckResult.exists ? 'exists' : 'does not exist'} in database.
                        </p>
                        {subdomainCheckResult.exists && subdomainCheckResult.org && (
                          <div className="mt-1 p-2 bg-yellow-100 rounded-sm">
                            <p>Organization Name: {subdomainCheckResult.org.name}</p>
                            <p>Website Enabled: {subdomainCheckResult.org.website_enabled ? 'Yes' : 'No'}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-yellow-700 text-left text-sm mt-1">
                        No database check performed.
                      </p>
                    )}
                  </div>
                </div>
              </Alert>
            )}
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
          
          {isSubdomainError && subdomain && (
            <Button
              className="w-full mt-2"
              onClick={() => checkSubdomainInDatabase(subdomain)}
              disabled={isChecking}
              variant="outline"
            >
              {isChecking ? "Checking..." : "Check Subdomain in Database"}
            </Button>
          )}
          
          {isSubdomainError && (
            <div className="text-sm text-gray-500 pt-4 border-t border-gray-200 mt-4">
              <p className="font-medium">Are you trying to access a church website? Check these common issues:</p>
              <ul className="list-disc list-inside mt-2 text-left">
                <li>The subdomain is spelled correctly</li>
                <li>The organization has configured their domain in settings</li>
                <li>The organization has <span className="font-medium">enabled their website</span> in settings</li>
                <li>The organization has created and published a homepage</li>
                
                {isUuidSubdomain && isDevelopmentEnvironment() && (
                  <li className="text-amber-600 font-medium">
                    You are in a development environment where UUIDs should be accessed via: <br />
                    <code className="bg-gray-100 px-1 py-0.5 text-xs rounded">/preview-domain/[UUID]</code>
                  </li>
                )}
                {isUuidSubdomain && (
                  <li>If you're using a UUID, use the preview URL format instead: <br />
                    <code className="bg-gray-100 px-1 py-0.5 text-xs rounded">/preview-domain/[UUID]</code>
                  </li>
                )}
              </ul>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-left text-xs text-gray-500">For organization administrators:</p>
                <ol className="list-decimal list-inside mt-1 text-left text-xs text-gray-500">
                  <li>Go to your organization dashboard</li>
                  <li>Check that your website is enabled</li>
                  <li>Verify your subdomain is correctly set</li>
                  <li>Ensure you have created and published a homepage</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
