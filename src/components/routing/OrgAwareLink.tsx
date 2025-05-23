
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
  
  // For subdomain access, ALWAYS use clean paths - never generate tenant-dashboard URLs
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
    
    console.log("OrgAwareLink: Subdomain access - clean path:", finalPath);
  } else {
    // For main domain (super admin), use path as-is
    finalPath = to;
    console.log("OrgAwareLink: Main domain access - path:", finalPath);
  }
  
  return (
    <Link to={finalPath} {...rest}>
      {children}
    </Link>
  );
});

OrgAwareLink.displayName = 'OrgAwareLink';

export default OrgAwareLink;
