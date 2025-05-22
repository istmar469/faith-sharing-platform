
import React from 'react';
import { useParams } from 'react-router-dom';
import LoadingState from './preview/LoadingState';
import ErrorState from './preview/ErrorState';
import EmptyState from './preview/EmptyState';
import PageContent from './preview/PageContent';
import useDomainPreview from './preview/useDomainPreview';

const DomainPreview = () => {
  const { subdomain } = useParams();
  const { 
    page, 
    loading, 
    error, 
    orgName, 
    orgData, 
    debugInfo 
  } = useDomainPreview(subdomain);
  
  if (loading) {
    return <LoadingState />;
  }
  
  if (error) {
    return (
      <ErrorState 
        error={error} 
        orgData={orgData} 
        debugInfo={debugInfo} 
      />
    );
  }
  
  if (!page) {
    return <EmptyState orgName={orgName} orgData={orgData} />;
  }
  
  return <PageContent page={page} />;
};

export default DomainPreview;
