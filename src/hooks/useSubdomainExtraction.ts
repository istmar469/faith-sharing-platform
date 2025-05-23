
import { useState, useEffect, useRef } from 'react';
import { extractSubdomain, isDevelopmentEnvironment } from "@/utils/domainUtils";

export const useSubdomainExtraction = () => {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isDevEnv, setIsDevEnv] = useState<boolean>(false);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const initRef = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (initRef.current) return;
    initRef.current = true;
    
    try {
      const hostname = window.location.hostname;
      const extractedSubdomain = extractSubdomain(hostname);
      const devEnv = isDevelopmentEnvironment();
      
      setSubdomain(extractedSubdomain);
      setIsDevEnv(devEnv);
      setHasInitialized(true);
      
    } catch (error) {
      console.error('Subdomain extraction error:', error);
      setHasInitialized(true);
    }
  }, []); // Empty dependency array

  return {
    subdomain,
    isDevEnv,
    hostname: window.location.hostname,
    hasInitialized
  };
};
