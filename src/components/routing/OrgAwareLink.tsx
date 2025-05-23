
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
  const { getOrgAwarePath, organizationId, isSubdomainAccess } = useTenantContext();
  const location = useLocation();
  
  console.log("OrgAwareLink: Generating link", { 
    to, 
    organizationId,
    currentPath: location.pathname,
    isSubdomainAccess,
    forceContext
  });
  
  let finalPath = to;
  
  // For subdomain access, ensure all links maintain organization context
  if (isSubdomainAccess && organizationId) {
    // If the link doesn't already include the organization context, add it
    if (!to.includes(`/tenant-dashboard/${organizationId}`) && 
        (to.startsWith('/page-builder') || 
         to.startsWith('/settings') || 
         to.startsWith('/pages') || 
         to.startsWith('/events') || 
         to.startsWith('/donations') ||
         to === '/tenant-dashboard')) {
      
      finalPath = to === '/tenant-dashboard' 
        ? `/tenant-dashboard/${organizationId}`
        : `/tenant-dashboard/${organizationId}${to}`;
    }
  } else {
    // Use existing logic for non-subdomain access
    finalPath = getOrgAwarePath(to);
  }
  
  // Special handling for page-builder paths to ensure they always have org context
  if (forceContext && organizationId && to.includes('/page-builder') && !finalPath.includes(`/${organizationId}/`)) {
    finalPath = `/tenant-dashboard/${organizationId}/page-builder`;
  }
  
  console.log("OrgAwareLink: Final path:", finalPath);
  
  return (
    <Link to={finalPath} {...rest}>
      {children}
    </Link>
  );
};

export default OrgAwareLink;
