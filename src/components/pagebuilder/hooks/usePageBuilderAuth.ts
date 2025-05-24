
import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

interface UsePageBuilderAuthProps {
  organizationId: string | null;
  isContextReady: boolean;
}

export const usePageBuilderAuth = ({ organizationId, isContextReady }: UsePageBuilderAuthProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleAuthenticated = useCallback(async (userId: string) => {
    console.log("=== PageBuilder: Authentication Success ===");
    const authStartTime = Date.now();
    
    if (!isContextReady || !organizationId) {
      console.error("PageBuilder: Missing context or organization ID");
      setAuthError("Could not determine organization context");
      return;
    }

    try {
      // Simplified access check - just verify membership
      console.log("PageBuilder: Checking user access...");
      const accessCheckStart = Date.now();
      
      const { count, error: accessError } = await Promise.race([
        supabase
          .from('organization_members')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .eq('user_id', userId),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Access check timeout')), 2000)
        )
      ]) as any;
      
      const accessCheckTime = Date.now() - accessCheckStart;
      console.log(`PageBuilder: Access check completed in ${accessCheckTime}ms`);
        
      if (accessError || count === 0) {
        console.error("PageBuilder: Access denied", { accessError, count });
        setAuthError("You do not have access to this organization");
        return;
      }

      const totalAuthTime = Date.now() - authStartTime;
      console.log(`PageBuilder: Total authentication flow: ${totalAuthTime}ms`);
      setIsAuthenticated(true);
      
    } catch (err) {
      const totalAuthTime = Date.now() - authStartTime;
      console.error(`PageBuilder: Authentication error after ${totalAuthTime}ms:`, err);
      setAuthError(`Error loading page builder: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [organizationId, isContextReady]);

  const handleNotAuthenticated = useCallback(() => {
    console.log("PageBuilder: User not authenticated");
    setAuthError("You must be logged in to access the page builder");
  }, []);

  // Timeout handling
  useEffect(() => {
    if (!isContextReady) return;
    
    const timeout = setTimeout(() => {
      if (isAuthenticated === null) {
        console.warn("PageBuilder: Authentication timeout reached after 2 seconds");
        setAuthError("Authentication timed out. Please check your connection and try again.");
        toast("Page builder authentication timed out. Please refresh and try again.");
      }
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [isAuthenticated, isContextReady]);

  return {
    isAuthenticated,
    authError,
    handleAuthenticated,
    handleNotAuthenticated
  };
};
