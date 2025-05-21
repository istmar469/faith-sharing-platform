
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Page } from "@/services/pages";
import PageElement from './elements/PageElement';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from 'lucide-react';

const DomainPreview = () => {
  // This component now handles both subdomain and organizationId parameters
  const { subdomain, organizationId } = useParams();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPageForDomain = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let orgId;
        
        // First, determine the organization ID to use
        if (organizationId) {
          // If organizationId is provided directly, use it
          orgId = organizationId;
        } else if (subdomain) {
          // If subdomain is provided, look up the organization
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('id, name')
            .eq('subdomain', subdomain)
            .single();
            
          if (orgError || !orgData) {
            setError(`Subdomain '${subdomain}' not found`);
            setLoading(false);
            return;
          }
          
          orgId = orgData.id;
          setOrgName(orgData.name);
        } else {
          // If neither is provided, show an error
          setError('No organization or subdomain specified');
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
          .single();
          
        if (pageError || !pageData) {
          setError('No published homepage found for this organization');
          setLoading(false);
          return;
        }
        
        // If we haven't set the org name yet, fetch it
        if (!orgName && organizationId) {
          const { data: orgData } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', organizationId)
            .single();
            
          if (orgData) {
            setOrgName(orgData.name);
          }
        }
        
        setPage(pageData as unknown as Page);
      } catch (err) {
        console.error('Error fetching page:', err);
        setError('An error occurred while fetching the page');
      } finally {
        setLoading(false);
      }
    };
    
    if (subdomain || organizationId) {
      fetchPageForDomain();
    }
  }, [subdomain, organizationId, orgName]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-8 mt-10">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!page) {
    return (
      <div className="max-w-3xl mx-auto p-8 mt-10">
        <Alert>
          <AlertDescription>No published homepage found for {orgName || 'this organization'}</AlertDescription>
        </Alert>
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
