
import React from 'react';
import { Link, LinkProps, useLocation } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';

interface OrgAwareLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
  preserveQuery?: boolean;
  forceContext?: boolean;
}

/**
 * A wrapper around React Router's Link component that makes paths
 * organization-aware based on the current tenant context and subdomain access.
 */
const OrgAwareLink: React.FC<OrgAwareLinkProps> = ({ 
  to, 
  children, 
  preserveQuery = false,
  forceContext = false,
  ...rest 
}) => {
  const { organizationId, isSubdomainAccess } = useTenantContext();
  const location = useLocation();
  
  console.log("OrgAwareLink: Generating link", { 
    to, 
    organizationId,
    currentPath: location.pathname,
    isSubdomainAccess,
    forceContext
  });
  
  let finalPath = to;
  
  // For subdomain access, always use simple paths - no organization prefixes
  if (isSubdomainAccess) {
    console.log("OrgAwareLink: Using simple subdomain path:", to);
    finalPath = to;
  } else {
    // For main domain access, add organization context if needed
    if (organizationId) {
      // For tenant dashboard route
      if (to === '/tenant-dashboard') {
        finalPath = `/tenant-dashboard/${organizationId}`;
      }
      // For other paths that should be organization-specific
      else if (
        to.startsWith('/page-builder') || 
        to.startsWith('/settings/') || 
        to.startsWith('/livestream') || 
        to.startsWith('/communication') ||
        to.startsWith('/templates') ||
        to.startsWith('/pages')
      ) {
        finalPath = `/tenant-dashboard/${organizationId}${to}`;
      }
    }
  }
  
  console.log("OrgAwareLink: Final path:", finalPath);
  
  return (
    <Link to={finalPath} {...rest}>
      {children}
    </Link>
  );
};

export default OrgAwareLink;
