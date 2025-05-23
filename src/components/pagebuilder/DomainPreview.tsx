
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import LoadingState from './preview/LoadingState';
import ErrorState from './preview/ErrorState';
import EmptyState from './preview/EmptyState';
import PageContent from './preview/PageContent';
import useDomainPreview from './preview/useDomainPreview';

const DomainPreview = () => {
  const { subdomain } = useParams();
  const location = useLocation();
  const { 
    page, 
    loading, 
    error, 
    orgName, 
    orgData, 
    debugInfo,
    pageIdParam
  } = useDomainPreview(subdomain);
  
  // Show a cleaner UI for preview mode
  const isPreviewMode = location.search.includes('preview=true') || pageIdParam;
  
  if (loading) {
    return <LoadingState />;
  }
  
  if (error) {
    return (
      <ErrorState 
        error={error} 
        orgData={orgData} 
        debugInfo={debugInfo} 
        isPreviewMode={isPreviewMode}
      />
    );
  }
  
  if (!page) {
    return <EmptyState orgName={orgName} orgData={orgData} isPreviewMode={isPreviewMode} />;
  }
  
  // Show the page content without any editor UI
  return (
    <div className="preview-container">
      {isPreviewMode && (
        <div className="bg-primary-900 text-white p-2 text-center text-sm">
          Preview Mode - This is how your page will appear to visitors
        </div>
      )}
      <PageContent page={page} />
    </div>
  );
};

export default DomainPreview;
