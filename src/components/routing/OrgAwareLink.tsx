
import React from 'react';
import { Link, LinkProps, useLocation } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';

interface OrgAwareLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
  preserveQuery?: boolean;
  forceContext?: boolean; // Force using organization context even for page builder
}

/**
 * A wrapper around React Router's Link component that makes paths
 * organization-aware based on the current tenant context.
 */
const OrgAwareLink: React.FC<OrgAwareLinkProps> = ({ 
  to, 
  children, 
  preserveQuery = false,
  forceContext = false,
  ...rest 
}) => {
  const { getOrgAwarePath, organizationId } = useTenantContext();
  const location = useLocation();
  
  // Add debug logging to help track navigation issues
  console.log("OrgAwareLink: Generating link", { 
    to, 
    organizationId,
    currentPath: location.pathname
  });
  
  const orgAwarePath = getOrgAwarePath(to);
  
  // Add additional debug to see the transformed path
  console.log("OrgAwareLink: Transformed to", orgAwarePath); 
  
  return (
    <Link to={orgAwarePath} {...rest}>
      {children}
    </Link>
  );
};

export default OrgAwareLink;
