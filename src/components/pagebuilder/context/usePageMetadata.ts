
import { useState } from 'react';
import { Page } from '@/services/pages';

export const usePageMetadata = (initialPageData?: Page | null) => {
  const [pageId, setPageId] = useState<string | null>(initialPageData?.id || null);
  const [pageTitle, setPageTitle] = useState<string>(initialPageData?.title || "New Page");
  const [pageSlug, setPageSlug] = useState<string>(initialPageData?.slug || "");
  const [metaTitle, setMetaTitle] = useState<string>(initialPageData?.meta_title || "");
  const [metaDescription, setMetaDescription] = useState<string>(initialPageData?.meta_description || "");
  const [parentId, setParentId] = useState<string | null>(initialPageData?.parent_id || null);
  const [showInNavigation, setShowInNavigation] = useState<boolean>(initialPageData?.show_in_navigation || true);
  const [isPublished, setIsPublished] = useState<boolean>(initialPageData?.published || false);
  const [isHomepage, setIsHomepage] = useState<boolean>(initialPageData?.is_homepage || false);
  
  return {
    pageId,
    setPageId,
    pageTitle,
    setPageTitle,
    pageSlug,
    setPageSlug,
    metaTitle,
    setMetaTitle,
    metaDescription, 
    setMetaDescription,
    parentId,
    setParentId,
    showInNavigation,
    setShowInNavigation,
    isPublished,
    setIsPublished,
    isHomepage,
    setIsHomepage
  };
};
