
import React from 'react';
import { Page } from "@/services/pages";
import PageElement from '../elements/PageElement';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';

interface PageContentProps {
  page: Page;
  showBackButton?: boolean;
}

const PageContent = ({ page, showBackButton = false }: PageContentProps) => {
  const navigate = useNavigate();
  const { organizationId } = useTenantContext();
  
  // Extract header and footer elements if they exist
  const headerElements = page.content?.filter(el => el.type === 'header') || [];
  const footerElements = page.content?.filter(el => el.type === 'footer') || [];
  const mainElements = page.content?.filter(el => el.type !== 'header' && el.type !== 'footer') || [];
  
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
      
      <div className="min-h-screen bg-white w-full flex flex-col">
        {/* Show back button if requested */}
        {showBackButton && (
          <div className="bg-white border-b border-gray-200 p-2 sticky top-0 z-10">
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
        )}
        
        {/* Header Section */}
        {headerElements.length > 0 && (
          <header className="w-full bg-white border-b border-gray-200">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-full">
              {headerElements.map((element) => (
                <PageElement
                  key={element.id}
                  element={element}
                  isSelected={false}
                  onClick={() => {}} // No editing on the preview
                />
              ))}
            </div>
          </header>
        )}
        
        {/* Main Content */}
        <main className="flex-grow">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-full">
            {mainElements.map((element) => (
              <PageElement
                key={element.id}
                element={element}
                isSelected={false}
                onClick={() => {}} // No editing on the preview
              />
            ))}
          </div>
        </main>
        
        {/* Footer Section */}
        {footerElements.length > 0 && (
          <footer className="w-full bg-gray-50 border-t border-gray-200">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-full">
              {footerElements.map((element) => (
                <PageElement
                  key={element.id}
                  element={element}
                  isSelected={false}
                  onClick={() => {}} // No editing on the preview
                />
              ))}
            </div>
          </footer>
        )}
      </div>
    </>
  );
};

export default PageContent;
