
import { useCallback } from 'react';
import { toast } from 'sonner';

export const usePagePreview = (organizationId: string | null, pageId: string | null) => {
  // Open preview in new window
  const openPreviewInNewWindow = useCallback(() => {
    if (!organizationId) {
      toast.error("Cannot preview: No organization ID available");
      return;
    }
    
    if (!pageId) {
      toast.warning("Please save the page first before previewing");
      return;
    }
    
    // Open preview in a new tab
    window.open(`/preview-domain/id-preview--${organizationId}?pageId=${pageId}&preview=true`, '_blank', 'width=1024,height=768');
  }, [organizationId, pageId]);

  return { openPreviewInNewWindow };
};
