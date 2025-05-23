
import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';

interface OrgAwareLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
  preserveQuery?: boolean;
}

/**
 * A wrapper around React Router's Link component that makes paths
 * organization-aware based on the current tenant context.
 */
const OrgAwareLink: React.FC<OrgAwareLinkProps> = ({ 
  to, 
  children, 
  preserveQuery = false,
  ...rest 
}) => {
  const { getOrgAwarePath } = useTenantContext();
  const orgAwarePath = getOrgAwarePath(to);
  
  return (
    <Link to={orgAwarePath} {...rest}>
      {children}
    </Link>
  );
};

export default OrgAwareLink;
