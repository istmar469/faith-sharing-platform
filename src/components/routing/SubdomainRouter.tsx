
import React, { useRef } from 'react';
import { useSubdomainDetection } from './hooks/useSubdomainDetection';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import LoginRequiredState from './components/LoginRequiredState';

/**
 * Component that handles subdomain-based routing
 * When a user visits a subdomain, this component:
 * 1. Detects the subdomain from the hostname
 * 2. Looks up the organization by subdomain
 * 3. Sets up the tenant context without forcing redirects
 */
const SubdomainRouter = () => {
  const initRef = useRef(false);
  
  const {
    loading,
    error,
    errorDetails,
    debugInfo,
    organizationId,
    loginDialogOpen,
    setLoginDialogOpen,
    orgData,
    checkOrganizationStatus,
    subdomain
  } = useSubdomainDetection();

  // Prevent multiple initializations
  if (!initRef.current) {
    initRef.current = true;
  }

  // Show loading state
  if (loading) {
    return <LoadingState message="Detecting organization..." />;
  }
  
  // Show login dialog if needed
  if (loginDialogOpen) {
    return (
      <LoginRequiredState 
        orgName={orgData?.name}
        isOpen={loginDialogOpen}
        setIsOpen={setLoginDialogOpen}
        subdomain={subdomain}
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
  
  // Router initialization complete - let normal routing take over
  return null;
};

export default SubdomainRouter;
