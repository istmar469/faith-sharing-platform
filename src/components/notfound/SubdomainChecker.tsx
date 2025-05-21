
import React, { useState } from 'react';
import { AlertTriangle, Database } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface SubdomainCheckerProps {
  subdomain: string | null;
}

interface CheckResult {
  exists: boolean;
  subdomain: string | null;
  org?: any;
}

const SubdomainChecker = ({ subdomain }: SubdomainCheckerProps) => {
  const [subdomainCheckResult, setSubdomainCheckResult] = useState<CheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

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

  if (!subdomain) {
    return null;
  }

  return (
    <>
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
      
      <Button
        className="w-full mt-2"
        onClick={() => checkSubdomainInDatabase(subdomain)}
        disabled={isChecking}
        variant="outline"
      >
        {isChecking ? "Checking..." : "Check Subdomain in Database"}
      </Button>
    </>
  );
};

export default SubdomainChecker;
