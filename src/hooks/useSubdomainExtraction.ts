
import { useState, useEffect } from 'react';
import { extractSubdomain, isDevelopmentEnvironment } from "@/utils/domainUtils";

export const useSubdomainExtraction = () => {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isDevEnv, setIsDevEnv] = useState<boolean>(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    const extractedSubdomain = extractSubdomain(hostname);
    const devEnv = isDevelopmentEnvironment();
    
    setSubdomain(extractedSubdomain);
    setIsDevEnv(devEnv);
    
    console.log("Subdomain extraction:", {
      hostname,
      extractedSubdomain,
      isDevEnv: devEnv
    });
  }, []);

  return {
    subdomain,
    isDevEnv,
    hostname: window.location.hostname
  };
};
