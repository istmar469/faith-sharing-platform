
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
  
  // Clean up any legacy tenant-dashboard paths
  if (to.includes('/tenant-dashboard')) {
    console.log("OrgAwareLink: Converting legacy tenant-dashboard path to /dashboard");
    finalPath = '/dashboard';
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
