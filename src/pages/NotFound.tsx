
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { isUuid, isDevelopmentEnvironment, getSubdomain } from "@/utils/domainUtils";
import NotFoundContent from "@/components/notfound/NotFoundContent";

const NotFound = () => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(false);

  const isSubdomainError = window.location.hostname.split(".").length > 2 && 
                         !window.location.hostname.startsWith("www");
                           
  // Check if the hostname appears to be a UUID being misinterpreted as a subdomain
  const isUuidSubdomain = isUuid(
    window.location.hostname.split(".")[0]
  );
  
  // Check if the current URL is a preview URL
  const isPreviewUrl = location.pathname.startsWith('/preview-domain/');
  
  const subdomain = getSubdomain(isPreviewUrl, location.pathname);

  // Get the current subdomain if applicable
  const currentSubdomain = window.location.hostname.split('.')[0];

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      "Hostname:",
      window.location.hostname,
      "Is development environment:",
      isDevelopmentEnvironment()
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-md">
        <NotFoundContent 
          isSubdomainError={isSubdomainError}
          isUuidSubdomain={isUuidSubdomain}
          subdomain={subdomain}
          currentSubdomain={currentSubdomain}
        />
      </div>
    </div>
  );
};

export default NotFound;
