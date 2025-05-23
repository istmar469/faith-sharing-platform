
import { useState, useEffect } from 'react';
import { extractSubdomain, isDevelopmentEnvironment } from "@/utils/domainUtils";

export const useSubdomainExtraction = () => {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isDevEnv, setIsDevEnv] = useState<boolean>(false);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);

  // Run only once during component mount - simplified to just extract, not set context
  useEffect(() => {
    if (hasInitialized) return;
    
    try {
      const hostname = window.location.hostname;
      const extractedSubdomain = extractSubdomain(hostname);
      const devEnv = isDevelopmentEnvironment();
      
      console.log("useSubdomainExtraction: Subdomain extraction only", {
        hostname,
        extractedSubdomain,
        devEnv,
      });
      
      // Only extract, don't set tenant context here
      setSubdomain(extractedSubdomain);
      setIsDevEnv(devEnv);
      setHasInitialized(true);
      
    } catch (error) {
      console.error("useSubdomainExtraction: Error during extraction:", error);
      setHasInitialized(true);
    }
  }, [hasInitialized]);

  return {
    subdomain,
    isDevEnv,
    hostname: window.location.hostname
  };
};
