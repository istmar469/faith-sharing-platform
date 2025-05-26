
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

  // Handle page builder routes - ensure they work on both subdomain and root domain
  if (finalPath.startsWith('/page-builder')) {
    if (isSubdomainAccess) {
      // For subdomain access, use the path as-is - subdomain provides organization context
      console.log("OrgAwareLink: Page builder route on subdomain, keeping path:", finalPath);
    } else if (organizationId && !finalPath.includes('organization_id')) {
      // For root domain with org context, add organization_id parameter
      const separator = finalPath.includes('?') ? '&' : '?';
      finalPath = `${finalPath}${separator}organization_id=${organizationId}`;
      console.log("OrgAwareLink: Page builder route on root domain, adding org context:", finalPath);
    }
  }
  // Handle dashboard navigation based on context
  else if (finalPath === '/dashboard' || finalPath === '/') {
    if (isSubdomainAccess) {
      // If on subdomain, go to subdomain root for dashboard
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
