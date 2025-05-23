
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import SideNav from '../components/dashboard/SideNav';
import { Loader2, Layout, Pencil, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useTenantContext } from '@/components/context/TenantContext';
import { createDefaultHomepage } from '@/services/defaultHomepageTemplate';

// Templates data - would be fetched from the database in a production app
const TEMPLATES = [
  {
    id: 'modern-church',
    name: 'Modern Church',
    description: 'A clean, contemporary design for modern churches with hero image and clear calls to action.',
    thumbnailUrl: '/placeholder.svg',
    pages: ['Home', 'About', 'Services', 'Events', 'Contact']
  },
  {
    id: 'traditional',
    name: 'Traditional',
    description: 'A classic design with traditional elements perfect for established churches.',
    thumbnailUrl: '/placeholder.svg',
    pages: ['Home', 'About Us', 'Weekly Schedule', 'Ministry', 'Contact']
  },
  {
    id: 'family-focused',
    name: 'Family Focused',
    description: 'Designed for churches with strong family and children\'s ministries.',
    thumbnailUrl: '/placeholder.svg',
    pages: ['Home', 'Kids', 'Youth', 'Parents', 'Events', 'Contact']
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'A simple, clean design that focuses on content with minimal distractions.',
    thumbnailUrl: '/placeholder.svg',
    pages: ['Home', 'About', 'Schedule', 'Connect']
  }
];

const TemplatesPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { organizationId } = useParams<{ organizationId: string }>();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const { organizationId: tenantOrgId, organizationName } = useTenantContext();
  
  // Use the organization ID from the URL params or fall back to the tenant context
  const effectiveOrgId = organizationId || tenantOrgId;
  
  const applyTemplate = async (templateId: string) => {
    if (!effectiveOrgId) {
      toast({
        title: "Error",
        description: "No organization ID found. Please select an organization first.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    setSelectedTemplate(templateId);
    
    try {
      // Find the template
      const template = TEMPLATES.find(t => t.id === templateId);
      
      if (!template) {
        throw new Error("Template not found");
      }
      
      // Check if organization exists
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, website_enabled')
        .eq('id', effectiveOrgId)
        .single();
        
      if (orgError || !orgData) {
        throw new Error("Organization not found");
      }
      
      // Enable website if not already enabled
      if (!orgData.website_enabled) {
        const { error: updateError } = await supabase
          .from('organizations')
          .update({ website_enabled: true })
          .eq('id', effectiveOrgId);
          
        if (updateError) {
          console.error("Error enabling website", updateError);
        }
      }
      
      // Check if homepage already exists
      const { data: existingHomepage } = await supabase
        .from('pages')
        .select('id')
        .eq('organization_id', effectiveOrgId)
        .eq('is_homepage', true)
        .single();
      
      // Create default homepage if it doesn't exist
      if (!existingHomepage) {
        await createDefaultHomepage(effectiveOrgId, orgData.name);
      }
      
      // Simulate template application delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Template applied",
        description: `${template.name} template has been applied successfully.`,
      });
      
      // Navigate to page builder for the homepage
      if (organizationId) {
        navigate(`/tenant-dashboard/${effectiveOrgId}/page-builder`);
      } else {
        navigate(`/page-builder`);
      }
    } catch (error) {
      console.error('Error applying template:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to apply template",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex h-screen bg-white">
      <SideNav isSuperAdmin={true} organizationId={effectiveOrgId} />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-4 sm:px-6 py-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Website Templates</h1>
            {organizationName && (
              <p className="text-sm text-muted-foreground">{organizationName}</p>
            )}
          </div>
        </header>
        
        <main className="p-4 sm:p-6">
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 sm:p-4 mb-6">
              <div className="flex items-center gap-2 text-blue-800">
                <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5" />
                <h2 className="text-base sm:text-lg font-medium">Choose a Template</h2>
              </div>
              <p className="text-sm sm:text-base text-blue-700 mt-1">
                Select a template to quickly build your church website. This will create a homepage that visitors can see when they visit your subdomain.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {TEMPLATES.map((template) => (
                <Card key={template.id} className={`overflow-hidden ${selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''}`}>
                  <div className="aspect-video bg-gray-100 relative">
                    <img 
                      src={template.thumbnailUrl} 
                      alt={template.name} 
                      className="w-full h-full object-cover"
                    />
                    {selectedTemplate === template.id && loading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                      </div>
                    )}
                    {selectedTemplate === template.id && !loading && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <CheckCircle className="h-12 w-12 text-blue-500" />
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="p-3 sm:p-4">
                    <CardTitle className="text-lg sm:text-xl">{template.name}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">{template.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-3 sm:p-4 pt-0">
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {template.pages.map((page) => (
                        <span key={page} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                          {page}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-3 sm:p-4 pt-0">
                    <Button 
                      onClick={() => applyTemplate(template.id)} 
                      disabled={loading}
                      className="w-full text-sm sm:text-base"
                    >
                      {selectedTemplate === template.id && loading ? (
                        <>
                          <Loader2 className="mr-2 h-3 sm:h-4 w-3 sm:w-4 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        <>
                          <Layout className="mr-2 h-3 sm:h-4 w-3 sm:w-4" /> 
                          Use This Template
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TemplatesPage;
