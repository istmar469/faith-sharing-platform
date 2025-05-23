
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import LoadingState from './preview/LoadingState';
import ErrorState from './preview/ErrorState';
import EmptyState from './preview/EmptyState';
import PageContent from './preview/PageContent';
import useDomainPreview from './preview/useDomainPreview';
import { ExternalLink } from 'lucide-react';

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
  // Convert to boolean to fix type error
  const isPreviewMode = location.search.includes('preview=true') || !!pageIdParam;
  
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
        <div className="bg-primary-900 text-white p-2 flex items-center justify-between">
          <div className="text-center text-sm w-full">
            Preview Mode - This is how your page will appear to visitors
          </div>
          {!window.opener && (
            <button 
              onClick={() => window.open(window.location.href, '_blank', 'width=1024,height=768')}
              className="flex items-center gap-1 text-xs bg-primary-800 px-2 py-1 rounded hover:bg-primary-700 transition-colors"
              title="Open in new window"
            >
              <ExternalLink size={14} />
              <span>New Window</span>
            </button>
          )}
        </div>
      )}
      <PageContent page={page} />
    </div>
  );
};

export default DomainPreview;
