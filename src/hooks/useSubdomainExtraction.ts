
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
      
      setSubdomain(extractedSubdomain);
      setIsDevEnv(devEnv);
      setHasInitialized(true);
      
      console.log("Subdomain extraction:", {
        hostname,
        extractedSubdomain,
        isDevEnv: devEnv,
        path: window.location.pathname
      });
    } catch (error) {
      console.error("Error during subdomain extraction:", error);
      setHasInitialized(true);
    }
  }, [hasInitialized]);

  return {
    subdomain,
    isDevEnv,
    hostname: window.location.hostname
  };
};
