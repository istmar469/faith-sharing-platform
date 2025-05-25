
import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';

interface OrgAwareLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
}

const OrgAwareLink: React.FC<OrgAwareLinkProps> = React.memo(({ 
  to, 
  children, 
  ...rest 
}) => {
  const { isSubdomainAccess } = useTenantContext();
  
  let finalPath = to;
  
  if (isSubdomainAccess) {
    // For subdomain access, clean up any tenant-dashboard paths
    if (to.includes('/tenant-dashboard/')) {
      const parts = to.split('/tenant-dashboard/');
      if (parts.length > 1) {
        const orgAndPath = parts[1].split('/', 2);
        if (orgAndPath.length > 1) {
          finalPath = '/' + orgAndPath[1];
        } else {
          finalPath = '/dashboard';
        }
      }
    } else if (to === '/tenant-dashboard') {
      finalPath = '/dashboard';
    } else {
      finalPath = to;
    }
  } else {
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
