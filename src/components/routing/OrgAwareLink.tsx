
import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';

interface OrgAwareLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
  preserveQuery?: boolean;
  forceContext?: boolean;
}

const OrgAwareLink: React.FC<OrgAwareLinkProps> = React.memo(({ 
  to, 
  children, 
  preserveQuery = false,
  forceContext = false,
  ...rest 
}) => {
  const { isSubdomainAccess } = useTenantContext();
  
  let finalPath = to;
  
  // For subdomain access, always use clean paths
  if (isSubdomainAccess) {
    // Clean up any tenant-dashboard paths for subdomain access
    if (to.includes('/tenant-dashboard/')) {
      const parts = to.split('/tenant-dashboard/');
      if (parts.length > 1) {
        const orgAndPath = parts[1].split('/', 2);
        if (orgAndPath.length > 1) {
          finalPath = '/' + orgAndPath[1];
        } else {
          finalPath = '/';
        }
      }
    } else {
      finalPath = to;
    }
  } else {
    // For main domain (super admin), use path as-is
    finalPath = to;
  }
  
  return (
    <Link to={finalPath} {...rest}>
      {children}
    </Link>
  );
});

OrgAwareLink.displayName = 'OrgAwareLink';

export default OrgAwareLink;
