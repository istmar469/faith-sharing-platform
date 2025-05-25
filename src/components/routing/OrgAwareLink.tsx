
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
  const { isSubdomainAccess, organizationId } = useTenantContext();
  
  let finalPath = to;
  
  // Clean up any legacy tenant-dashboard paths
  if (to.includes('/tenant-dashboard')) {
    console.log("OrgAwareLink: Converting legacy tenant-dashboard path to /dashboard");
    finalPath = '/dashboard';
  } else {
    finalPath = to;
  }

  // Handle dashboard navigation based on context
  if (finalPath === '/dashboard' || finalPath === '/') {
    if (isSubdomainAccess) {
      // If on subdomain, go to subdomain root
      finalPath = '/';
    } else if (organizationId && finalPath === '/dashboard') {
      // If not on subdomain but have organization ID, go to specific organization dashboard
      finalPath = `/dashboard/${organizationId}`;
    } else if (!organizationId && finalPath === '/dashboard') {
      // If no organization context, go to main dashboard
      finalPath = '/dashboard';
    }
  }
  
  console.log("OrgAwareLink: Navigation", {
    originalPath: to,
    finalPath,
    isSubdomainAccess,
    organizationId
  });
  
  return (
    <Link to={finalPath} {...rest}>
      {children}
    </Link>
  );
});

OrgAwareLink.displayName = 'OrgAwareLink';

export default OrgAwareLink;
