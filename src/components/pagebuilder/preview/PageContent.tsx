
import React from 'react';
import { Page } from "@/services/pages";
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import EditorRenderer from '../editor/EditorRenderer';

interface PageContentProps {
  page: Page;
  showBackButton?: boolean;
}

const PageContent = ({ page, showBackButton = false }: PageContentProps) => {
  const navigate = useNavigate();
  const { organizationId } = useTenantContext();
  
  const handleBackToDashboard = () => {
    if (organizationId) {
      navigate(`/tenant-dashboard/${organizationId}`);
    } else {
      navigate('/tenant-dashboard');
    }
  };
  
  return (
    <>
      <Helmet>
        <title>{page.meta_title || page.title}</title>
        {page.meta_description && <meta name="description" content={page.meta_description} />}
      </Helmet>
      
      <div className="min-h-screen bg-white w-full flex flex-col site-content">
        {/* Show back button if requested */}
        {showBackButton && (
          <div className="bg-white border-b border-gray-200 p-2 sticky top-0 z-10 site-back-button">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBackToDashboard}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}
        
        {/* Main Content - Use EditorRenderer for Editor.js content */}
        <main className="flex-grow site-main-content">
          {page.title && (
            <div className="max-w-4xl mx-auto px-4 py-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center">{page.title}</h1>
            </div>
          )}
          
          <div className="max-w-4xl mx-auto px-4 pb-8">
            <div className="prose max-w-none">
              <EditorRenderer data={page.content} />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default PageContent;
