
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Page } from "@/services/pages";
import PageElement from './elements/PageElement';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from 'lucide-react';

const DomainPreview = () => {
  const { subdomain } = useParams();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPageForDomain = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First, find the organization with this subdomain
        const { data: domainData, error: domainError } = await supabase
          .from('domain_settings')
          .select('organization_id')
          .eq('subdomain', subdomain)
          .single();
          
        if (domainError || !domainData) {
          setError(`Subdomain '${subdomain}' not found`);
          setLoading(false);
          return;
        }
        
        // Then fetch the homepage for this organization
        const { data: pageData, error: pageError } = await supabase
          .from('pages')
          .select('*')
          .eq('organization_id', domainData.organization_id)
          .eq('is_homepage', true)
          .eq('published', true)
          .single();
          
        if (pageError || !pageData) {
          setError('No published homepage found for this domain');
          setLoading(false);
          return;
        }
        
        setPage(pageData as unknown as Page);
      } catch (err) {
        console.error('Error fetching page:', err);
        setError('An error occurred while fetching the page');
      } finally {
        setLoading(false);
      }
    };
    
    if (subdomain) {
      fetchPageForDomain();
    }
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
          <AlertDescription>No page found for this domain</AlertDescription>
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
