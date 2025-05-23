
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSubdomainDetection } from './hooks/useSubdomainDetection';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import LoginRequiredState from './components/LoginRequiredState';

/**
 * Component that handles subdomain-based routing
 * When a user visits a subdomain, this component:
 * 1. Detects the subdomain from the hostname
 * 2. Looks up the organization by subdomain
 * 3. Routes to the appropriate view
 */
const SubdomainRouter = () => {
  const {
    loading,
    error,
    errorDetails,
    debugInfo,
    organizationId,
    loginDialogOpen,
    setLoginDialogOpen,
    orgData,
    checkOrganizationStatus
  } = useSubdomainDetection();

  // Show loading state
  if (loading) {
    return <LoadingState />;
  }
  
  // Show login dialog if needed
  if (loginDialogOpen) {
    return (
      <LoginRequiredState 
        orgName={orgData?.name}
        isOpen={loginDialogOpen}
        setIsOpen={setLoginDialogOpen}
      />
    );
  }
  
  // Show error state if there's an error
  if (error) {
    return (
      <ErrorState 
        error={error}
        errorDetails={errorDetails}
        debugInfo={debugInfo}
        onDiagnostic={checkOrganizationStatus}
      />
    );
  }
  
  // If we found an organization ID from the subdomain, redirect to tenant dashboard
  if (organizationId) {
    console.log("Redirecting to tenant dashboard for organization:", organizationId);
    return <Navigate to={`/tenant-dashboard/${organizationId}`} replace />;
  }
  
  // If no subdomain or no matching organization, continue with normal routing
  console.log("No subdomain routing applied, continuing with normal routing");
  return null;
};

export default SubdomainRouter;
