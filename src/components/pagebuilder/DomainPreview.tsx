
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Page } from "@/services/pages";
import PageElement from './elements/PageElement';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from 'lucide-react';

const DomainPreview = () => {
  const { subdomain } = useParams();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPageForDomain = async () => {
      if (!subdomain) {
        setError('No subdomain or organization ID provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        console.log("Fetching page for identifier:", subdomain);
        
        // Check if the subdomain parameter is a UUID (organization ID)
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subdomain);
        
        let orgId;
        let actualSubdomain;
        
        if (isUuid) {
          // If subdomain parameter is a UUID, use it as the organization ID directly
          console.log("Treating as organization ID:", subdomain);
          orgId = subdomain;
          actualSubdomain = null;
          
          // Look up the organization name
          const { data: orgData } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', orgId)
            .single();
            
          if (orgData) {
            setOrgName(orgData.name);
          }
        } else {
          // If subdomain is an actual subdomain string, look up the organization
          console.log("Treating as subdomain:", subdomain);
          actualSubdomain = subdomain;
          
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('id, name')
            .eq('subdomain', actualSubdomain)
            .single();
              
          if (orgError || !orgData) {
            console.error("Error or no organization found:", orgError);
            setError(`No organization exists with subdomain: ${actualSubdomain}`);
            setLoading(false);
            return;
          }
          
          orgId = orgData.id;
          setOrgName(orgData.name);
          console.log("Found organization:", orgData.name, "with ID:", orgId);
        }
        
        if (!orgId) {
          setError('Could not determine organization ID');
          setLoading(false);
          return;
        }
        
        // Then fetch the homepage for this organization
        const { data: pageData, error: pageError } = await supabase
          .from('pages')
          .select('*')
          .eq('organization_id', orgId)
          .eq('is_homepage', true)
          .eq('published', true)
          .maybeSingle();
          
        if (pageError) {
          console.error('Error fetching page:', pageError);
          setError('An error occurred while fetching the page');
          setLoading(false);
          return;
        }
        
        if (!pageData) {
          setError('No published homepage found for this organization');
          setLoading(false);
          return;
        }
        
        setPage(pageData as unknown as Page);
        console.log("Found page:", pageData.title);
      } catch (err) {
        console.error('Error in fetchPageForDomain:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPageForDomain();
  }, [subdomain]);
  
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
          <AlertTitle>Subdomain Error</AlertTitle>
          <AlertDescription className="text-center font-medium">
            {error}
          </AlertDescription>
        </Alert>
        <h1 className="text-2xl font-bold mb-4">Organization Not Found</h1>
        <p className="text-gray-600">No organization found for this subdomain</p>
        <a 
          href="/dashboard"
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 inline-block"
        >
          Go to Dashboard
        </a>
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
        <a 
          href="/dashboard" 
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 inline-block"
        >
          Go to Dashboard
        </a>
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
