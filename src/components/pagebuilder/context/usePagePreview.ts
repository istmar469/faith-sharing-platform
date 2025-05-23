import { useCallback } from 'react';
import { toast } from 'sonner';
import { extractSubdomain, isDevelopmentEnvironment } from '@/utils/domainUtils';

export const usePagePreview = (organizationId: string | null, pageId: string | null) => {
  // Open preview in new window with subdomain context preservation
  const openPreviewInNewWindow = useCallback(() => {
    if (!organizationId) {
      toast.error("Cannot preview: No organization ID available");
      return;
    }
    
    if (!pageId) {
      toast.warning("Please save the page first before previewing");
      return;
    }
    
    // Check if we're already on a subdomain
    const hostname = window.location.hostname;
    const subdomain = extractSubdomain(hostname);
    const isSubdomainAccess = !isDevelopmentEnvironment() && !!subdomain;
    
    let previewUrl;
    
    if (isSubdomainAccess) {
      // If already on subdomain, use current subdomain for preview
      previewUrl = `/preview-domain/${subdomain}?pageId=${pageId}&preview=true`;
    } else {
      // Otherwise use organization ID for preview
      previewUrl = `/preview-domain/id-preview--${organizationId}?pageId=${pageId}&preview=true`;
    }
    
    // Open preview in a new tab
    window.open(previewUrl, '_blank', 'width=1024,height=768');
  }, [organizationId, pageId]);

  return { openPreviewInNewWindow };
};
