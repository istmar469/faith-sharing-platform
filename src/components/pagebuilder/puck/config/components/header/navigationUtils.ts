
import { useCallback } from 'react';
import { NavigationPage } from './SortableNavigationItem';

export const useNavigationHandlers = () => {
  const handleEditPage = useCallback((pageId: string) => {
    const isInPageBuilder = window.location.pathname.includes('/page-builder');
    
    if (isInPageBuilder) {
      const currentParams = new URLSearchParams(window.location.search);
      const organizationParam = currentParams.get('organization_id');
      const newUrl = organizationParam 
        ? `/page-builder/${pageId}?organization_id=${organizationParam}`
        : `/page-builder/${pageId}`;
      
      window.history.pushState({}, '', newUrl);
      window.location.reload();
    } else {
      const currentDomain = window.location.origin;
      const pageEditUrl = `${currentDomain}/page-builder/${pageId}`;
      window.open(pageEditUrl, '_blank');
    }
  }, []);

  const handleCreateNewPage = useCallback(() => {
    const isInPageBuilder = window.location.pathname.includes('/page-builder');
    
    if (isInPageBuilder) {
      const currentParams = new URLSearchParams(window.location.search);
      const organizationParam = currentParams.get('organization_id');
      const newUrl = organizationParam 
        ? `/page-builder/new?organization_id=${organizationParam}`
        : `/page-builder/new`;
      
      window.history.pushState({}, '', newUrl);
      window.location.reload();
    } else {
      const currentDomain = window.location.origin;
      const newPageUrl = `${currentDomain}/page-builder`;
      window.open(newPageUrl, '_blank');
    }
  }, []);

  const handleNavigationClick = useCallback((href: string, isExternal?: boolean) => {
    if (isExternal) {
      window.open(href, '_blank');
    } else {
      const cleanHref = href.startsWith('/') ? href.substring(1) : href;
      
      if (cleanHref === '' || cleanHref === 'home') {
        window.location.href = '/';
      } else {
        window.location.href = `/${cleanHref}`;
      }
    }
  }, []);

  return {
    handleEditPage,
    handleCreateNewPage,
    handleNavigationClick
  };
};

export const createNavigationItems = (
  pages: NavigationPage[],
  customNavigationItems: Array<{
    label: string;
    href: string;
    isExternal?: boolean;
  }> = []
) => {
  const visiblePages = Array.isArray(pages) ? pages.filter(page => 
    page && 
    typeof page === 'object' && 
    page.show_in_navigation && 
    page.published && 
    page.title && 
    page.slug
  ) : [];

  return [
    ...visiblePages.map(page => {
      if (!page || typeof page !== 'object' || !page.title) {
        return null;
      }
      
      return {
        label: page.title,
        href: page.is_homepage ? '/' : `/${page.slug}`,
        isExternal: false
      };
    }).filter(Boolean),
    ...(Array.isArray(customNavigationItems) ? customNavigationItems : [])
  ];
};
