
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Page } from "@/services/pages";
import { useToast } from "@/components/ui/use-toast";

export const useDomainPreview = (subdomain: string | undefined) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [orgData, setOrgData] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  // Get specific pageId from URL query params
  const queryParams = new URLSearchParams(location.search);
  const pageIdParam = queryParams.get('pageId');
  
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
        console.log("PageId from query params:", pageIdParam);
        
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
          lookup: {},
          pageIdParam
        };
        
        if (isUuid) {
          // If subdomain parameter is a UUID, use it as the organization ID directly
          console.log("DomainPreview: Treating as organization ID:", subdomain);
          orgId = subdomain;
          actualSubdomain = null;
          
          // Check if organization exists first
          const { data, error: orgError } = await supabase
            .from('organizations')
            .select('id, name, subdomain, website_enabled')
            .eq('id', orgId)
            .maybeSingle();
            
          debugData.lookup.byId = { result: data, error: orgError };
          console.log("DomainPreview: Organization lookup result:", data, orgError);
            
          if (orgError) {
            console.error("DomainPreview: Error fetching organization details:", orgError);
            setError(`Error fetching organization details: ${orgError.message}`);
            setLoading(false);
            setDebugInfo(debugData);
            return;
          }
          
          if (!data) {
            console.error("DomainPreview: Organization ID not found:", orgId);
            setError(`No organization exists with ID: ${subdomain}`);
            toast({
              title: "Organization Not Found",
              description: `The organization with ID ${subdomain} does not exist in the database`,
              variant: "destructive"
            });
            setLoading(false);
            setDebugInfo(debugData);
            return;
          }
          
          setOrgName(data.name);
          setOrgData(data);
          actualSubdomain = data.subdomain;
          debugData.orgData = data;
          
          // Check if website is enabled
          if (data.website_enabled === false) {
            setError(`${data.name}'s website is currently disabled`);
            setLoading(false);
            setDebugInfo(debugData);
            return;
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
              const { data, error: orgError } = await supabase
                .from('organizations')
                .select('id, name, subdomain, website_enabled')
                .eq('id', orgId)
                .maybeSingle();
                
              debugData.lookup.byExtractedId = { result: data, error: orgError };
              console.log("DomainPreview: Organization lookup result:", data, orgError);
                
              if (orgError) {
                console.error("DomainPreview: Organization ID not found:", orgError);
                setError(`No organization exists with ID: ${previewId}`);
                setLoading(false);
                setDebugInfo(debugData);
                return;
              }
              
              if (!data) {
                setError(`No organization found with ID: ${previewId}`);
                setLoading(false);
                setDebugInfo(debugData);
                return;
              }
              
              setOrgName(data.name);
              setOrgData(data);
              actualSubdomain = data.subdomain;
              debugData.orgData = data;
              
              // Check if website is enabled
              if (data.website_enabled === false) {
                setError(`${data.name}'s website is currently disabled`);
                setLoading(false);
                setDebugInfo(debugData);
                return;
              }
            }
          } else {
            // If subdomain is an actual subdomain string, look up the organization
            console.log("DomainPreview: Treating as subdomain:", subdomain);
            actualSubdomain = subdomain;
            
            // Direct query to check if the subdomain exists in the database
            const { data, error: orgError } = await supabase
              .from('organizations')
              .select('id, name, subdomain, website_enabled')
              .eq('subdomain', subdomain)
              .maybeSingle();
                
            debugData.lookup.bySubdomain = { result: data, error: orgError };
            console.log("DomainPreview: Organization lookup result:", data, orgError);
            
            if (orgError || !data) {
              console.error("DomainPreview: Error or no organization found:", orgError);
              setError(`No organization exists with subdomain: ${actualSubdomain}`);
              setLoading(false);
              setDebugInfo(debugData);
              return;
            }
            
            setOrgData(data);
            debugData.orgData = data;
            
            // Check if website is enabled
            if (data.website_enabled === false) {
              setError(`${data.name}'s website is currently disabled`);
              setLoading(false);
              setDebugInfo(debugData);
              return;
            }
            
            orgId = data.id;
            setOrgName(data.name);
            console.log("DomainPreview: Found organization:", data.name, "with ID:", orgId);
          }
        }
        
        if (!orgId) {
          setError('Could not determine organization ID');
          setLoading(false);
          setDebugInfo(debugData);
          return;
        }
        
        // If we have a specific pageId from query params, use it instead of the homepage
        if (pageIdParam) {
          console.log("DomainPreview: Fetching specific page:", pageIdParam);
          const { data: specificPageData, error: specificPageError } = await supabase
            .from('pages')
            .select('*')
            .eq('organization_id', orgId)
            .eq('id', pageIdParam)
            .maybeSingle();
            
          debugData.specificPage = { result: specificPageData, error: specificPageError };
          console.log("DomainPreview: Specific page lookup result:", specificPageData, specificPageError);
            
          if (specificPageError) {
            console.error('DomainPreview: Error fetching specific page:', specificPageError);
            setError('An error occurred while fetching the requested page');
            setLoading(false);
            setDebugInfo(debugData);
            return;
          }
          
          if (!specificPageData) {
            setError('The requested page was not found');
            setLoading(false);
            setDebugInfo(debugData);
            return;
          }
          
          setPage(specificPageData as unknown as Page);
          setDebugInfo(debugData);
          console.log("DomainPreview: Found specific page:", specificPageData.title);
          setLoading(false);
          return;
        }
        
        // If no specific pageId, fetch the homepage
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
  }, [subdomain, navigate, toast, pageIdParam, location.search]);
  
  return {
    page,
    loading,
    error,
    orgName,
    orgData,
    debugInfo,
    pageIdParam
  };
};

export default useDomainPreview;
