
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Page } from "@/services/pages";
import PageElement from './elements/PageElement';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Info, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DomainPreview = () => {
  const { subdomain } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [orgData, setOrgData] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  
  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };
  
  useEffect(() => {
    const fetchPageForDomain = async () => {
      if (!subdomain) {
        setError('No subdomain or organization ID provided');
        setLoading(false);
        setDebugInfo({ issue: "No subdomain provided" });
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        console.log("DomainPreview: Fetching page for identifier:", subdomain);
        
        // Don't treat "church-os" as a subdomain since it's the base domain
        if (subdomain === "church-os") {
          setError("This is the base domain. Please use a specific organization subdomain.");
          setLoading(false);
          setDebugInfo({ issue: "Base domain used" });
          return;
        }
        
        // Check if the subdomain parameter is a UUID (organization ID)
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subdomain);
        
        let orgId;
        let actualSubdomain;
        const debugData: any = { 
          subdomain,
          isUuid,
          lookup: {}
        };
        
        if (isUuid) {
          // If subdomain parameter is a UUID, use it as the organization ID directly
          console.log("DomainPreview: Treating as organization ID:", subdomain);
          orgId = subdomain;
          actualSubdomain = null;
          
          // Look up the organization name and details
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('name, subdomain, website_enabled')
            .eq('id', orgId)
            .single();
            
          debugData.lookup.byId = { result: orgData, error: orgError };
          console.log("DomainPreview: Organization lookup result:", orgData, orgError);
            
          if (orgError || !orgData) {
            console.error("DomainPreview: Organization ID not found:", orgError);
            setError(`No organization exists with ID: ${subdomain}`);
            setLoading(false);
            setDebugInfo(debugData);
            return;
          }
          
          if (orgData) {
            setOrgName(orgData.name);
            setOrgData(orgData);
            actualSubdomain = orgData.subdomain;
            debugData.orgData = orgData;
            
            // Check if website is enabled
            if (orgData.website_enabled === false) {
              setError(`${orgData.name}'s website is currently disabled`);
              setLoading(false);
              setDebugInfo(debugData);
              return;
            }
          }
        } else {
          // Handle special id-preview-- format by extracting the ID
          const previewMatch = subdomain.match(/^id-preview--(.+)$/i);
          if (previewMatch) {
            const previewId = previewMatch[1];
            console.log("DomainPreview: Preview format detected, using ID:", previewId);
            debugData.previewFormat = { detected: true, id: previewId };
            
            // Check if the extracted ID is a UUID (organization ID)
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(previewId)) {
              orgId = previewId;
              
              // Look up the organization name and details
              const { data: orgData, error: orgError } = await supabase
                .from('organizations')
                .select('name, subdomain, website_enabled')
                .eq('id', orgId)
                .single();
                
              debugData.lookup.byExtractedId = { result: orgData, error: orgError };
              console.log("DomainPreview: Organization lookup result:", orgData, orgError);
                
              if (orgError) {
                console.error("DomainPreview: Organization ID not found:", orgError);
                setError(`No organization exists with ID: ${previewId}`);
                setLoading(false);
                setDebugInfo(debugData);
                return;
              }
              
              if (orgData) {
                setOrgName(orgData.name);
                setOrgData(orgData);
                actualSubdomain = orgData.subdomain;
                debugData.orgData = orgData;
                
                // Check if website is enabled
                if (orgData.website_enabled === false) {
                  setError(`${orgData.name}'s website is currently disabled`);
                  setLoading(false);
                  setDebugInfo(debugData);
                  return;
                }
              }
            }
          } else {
            // If subdomain is an actual subdomain string, look up the organization
            console.log("DomainPreview: Treating as subdomain:", subdomain);
            actualSubdomain = subdomain;
            
            // Direct query to check if the subdomain exists in the database
            const { data: orgData, error: orgError } = await supabase
              .from('organizations')
              .select('id, name, subdomain, website_enabled')
              .eq('subdomain', subdomain)
              .maybeSingle();
                
            debugData.lookup.bySubdomain = { result: orgData, error: orgError };
            console.log("DomainPreview: Organization lookup result:", orgData, orgError);
            
            if (orgError || !orgData) {
              console.error("DomainPreview: Error or no organization found:", orgError);
              setError(`No organization exists with subdomain: ${actualSubdomain}`);
              setLoading(false);
              setDebugInfo(debugData);
              return;
            }
            
            setOrgData(orgData);
            debugData.orgData = orgData;
            
            // Check if website is enabled
            if (orgData.website_enabled === false) {
              setError(`${orgData.name}'s website is currently disabled`);
              setLoading(false);
              setDebugInfo(debugData);
              return;
            }
            
            orgId = orgData.id;
            setOrgName(orgData.name);
            console.log("DomainPreview: Found organization:", orgData.name, "with ID:", orgId);
          }
        }
        
        if (!orgId) {
          setError('Could not determine organization ID');
          setLoading(false);
          setDebugInfo(debugData);
          return;
        }
        
        // Then fetch the homepage for this organization
        console.log("DomainPreview: Fetching homepage for organization:", orgId);
        const { data: pageData, error: pageError } = await supabase
          .from('pages')
          .select('*')
          .eq('organization_id', orgId)
          .eq('is_homepage', true)
          .eq('published', true)
          .maybeSingle();
          
        debugData.homepage = { result: pageData, error: pageError };
        console.log("DomainPreview: Homepage lookup result:", pageData, pageError);
          
        if (pageError) {
          console.error('DomainPreview: Error fetching page:', pageError);
          setError('An error occurred while fetching the page');
          setLoading(false);
          setDebugInfo(debugData);
          return;
        }
        
        if (!pageData) {
          setError('No published homepage found for this organization');
          setLoading(false);
          setDebugInfo(debugData);
          return;
        }
        
        setPage(pageData as unknown as Page);
        setDebugInfo(debugData);
        console.log("DomainPreview: Found page:", pageData.title);
      } catch (err) {
        console.error('DomainPreview: Error in fetchPageForDomain:', err);
        setError('An unexpected error occurred');
        setDebugInfo({ error: err });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPageForDomain();
  }, [subdomain, navigate]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Alert variant="destructive" className="max-w-md mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Website Error</AlertTitle>
          <AlertDescription className="text-center font-medium">
            {error}
          </AlertDescription>
        </Alert>
        
        {orgData && (
          <div className="max-w-md mb-6">
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Organization Details</AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {orgData.name}</p>
                  <p><span className="font-medium">Subdomain:</span> {orgData.subdomain || 'Not set'}</p>
                  <p><span className="font-medium">Website Enabled:</span> {orgData.website_enabled ? 'Yes' : 'No'}</p>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2"
            >
              Go to Dashboard
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="px-4 py-2"
            >
              Try Again
            </Button>
          </div>
          
          <Button 
            onClick={toggleDebug} 
            variant="secondary"
            size="sm"
          >
            {showDebug ? "Hide Debug Info" : "Show Debug Info"}
          </Button>
          
          {showDebug && debugInfo && (
            <div className="max-w-md p-4 mt-2 bg-gray-100 border border-gray-300 rounded-md text-left overflow-auto max-h-80">
              <h4 className="text-sm font-bold mb-2">Debug Information</h4>
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Alert className="max-w-md mb-4">
          <AlertDescription>
            No published homepage found for {orgName || 'this organization'}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => navigate('/dashboard')} 
          className="mt-4"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      {/* Render the page content */}
      <div className="mx-auto">
        {page.content?.map((element) => (
          <PageElement
            key={element.id}
            element={element}
            isSelected={false}
            onClick={() => {}} // No editing on the front-end
          />
        ))}
      </div>
    </div>
  );
};

export default DomainPreview;
