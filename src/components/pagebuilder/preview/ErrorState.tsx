
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Database, RefreshCcw, AlertCircle, Search } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ErrorStateProps {
  error: string;
  orgData?: any;
  debugInfo?: any;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, orgData, debugInfo }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  const checkHomepage = async () => {
    if (!orgData?.id) {
      toast({
        title: "Error",
        description: "No organization ID available to check",
        variant: "destructive"
      });
      return;
    }
    
    setIsChecking(true);
    try {
      // Check for a homepage for this organization
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('id, title, published, is_homepage')
        .eq('organization_id', orgData.id)
        .eq('is_homepage', true)
        .maybeSingle();
      
      const result = {
        homepageData: pageData,
        homepageError: pageError,
        timestamp: new Date().toISOString()
      };
      
      console.log("Homepage check results:", result);
      setCheckResult(result);
      
      toast({
        title: pageData ? "Homepage Found" : "No Homepage Found",
        description: pageData 
          ? `Homepage "${pageData.title}" exists${pageData.published ? ' and is published.' : ' but is not published.'}`
          : `No homepage found for this organization. You need to create one using the page builder.`,
        variant: pageData ? "default" : "destructive"
      });
    } catch (err) {
      console.error("Error checking homepage:", err);
      toast({
        title: "Error",
        description: "Failed to check homepage existence",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const navigateToPageBuilder = () => {
    if (orgData?.id) {
      navigate(`/page-builder?organization_id=${orgData.id}`);
    } else {
      toast({
        title: "Error",
        description: "No organization ID available to create a page",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <Alert variant="destructive" className="max-w-md mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          <p className="mb-4">{error}</p>
          
          {orgData && (
            <div className="p-2 bg-blue-50 border border-blue-100 rounded mb-4">
              <p className="text-sm font-medium text-blue-800">
                Organization: {orgData.name}
              </p>
              <p className="text-xs text-blue-700">
                ID: {orgData.id}
              </p>
              {orgData.subdomain && (
                <p className="text-xs text-blue-700">
                  Subdomain: {orgData.subdomain}
                </p>
              )}
              {orgData.website_enabled === false && (
                <p className="text-xs text-red-600 font-semibold mt-1">
                  Note: Website functionality is currently disabled for this organization
                </p>
              )}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {orgData && orgData.id && (
        <Alert className="max-w-md mb-4">
          <Database className="h-4 w-4" />
          <AlertTitle>Homepage Check</AlertTitle>
          <AlertDescription>
            <p className="mb-2">Let's check if there's a homepage for this organization.</p>
            
            <div className="flex flex-wrap gap-2 mt-2">
              <Button 
                onClick={checkHomepage}
                disabled={isChecking}
                size="sm"
                variant="outline"
              >
                {isChecking ? "Checking..." : "Check Homepage"}
              </Button>
              
              <Button 
                onClick={navigateToPageBuilder}
                size="sm"
              >
                Create/Edit Pages
              </Button>
            </div>
            
            {checkResult && (
              <div className="mt-3 p-2 border rounded bg-gray-50 text-sm">
                {checkResult.homepageData ? (
                  <>
                    <p className="font-medium">Homepage found:</p>
                    <p>Title: {checkResult.homepageData.title}</p>
                    <p>Status: {checkResult.homepageData.published ? 'Published' : 'Not published'}</p>
                  </>
                ) : (
                  <p>No homepage found for this organization. You need to create one using the page builder.</p>
                )}
                
                <button 
                  onClick={() => setShowDebug(!showDebug)} 
                  className="text-blue-600 text-xs underline mt-1"
                >
                  {showDebug ? "Hide Details" : "Show Details"}
                </button>
                {showDebug && (
                  <pre className="mt-2 p-2 bg-gray-100 text-xs overflow-auto max-h-40">
                    {JSON.stringify(checkResult, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {debugInfo && (
        <div className="max-w-md w-full mt-4">
          <button 
            onClick={() => setShowDebug(!showDebug)} 
            className="text-sm text-blue-600 underline mb-2"
          >
            {showDebug ? "Hide Debug Information" : "Show Debug Information"}
          </button>
          
          {showDebug && (
            <div className="p-3 bg-gray-100 rounded border text-xs font-mono overflow-auto max-h-80">
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorState;
