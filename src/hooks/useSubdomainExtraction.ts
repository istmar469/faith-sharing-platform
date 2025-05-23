
import { useState, useEffect } from 'react';
import { extractSubdomain, isDevelopmentEnvironment } from "@/utils/domainUtils";

export const useSubdomainExtraction = () => {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isDevEnv, setIsDevEnv] = useState<boolean>(false);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);

  // Run only once during component mount
  useEffect(() => {
    if (hasInitialized) return;
    
    try {
      const hostname = window.location.hostname;
      const extractedSubdomain = extractSubdomain(hostname);
      const devEnv = isDevelopmentEnvironment();
      
      console.log("useSubdomainExtraction: Initial extraction", {
        hostname,
        extractedSubdomain,
        devEnv,
      });
      
      // Important: Always set subdomain if detected, even in dev environment
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
