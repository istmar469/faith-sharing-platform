import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import { toast } from 'sonner';
import { PageData, savePage, getPage } from '@/services/pageService';
import { safeCastToPuckData, createDefaultPuckData } from '@/components/pagebuilder/utils/puckDataHelpers';
import { isMainDomain } from '@/utils/domain/domainDetectionUtils';

// Helper function to generate valid slugs that match the validation schema
const generateValidSlug = (title: string, isNewPage: boolean = false): string => {
  let slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove all non-alphanumeric characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple consecutive hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens
    || 'untitled-page'; // Fallback if the result is empty

  // For new pages, add a timestamp suffix to make the slug more unique
  if (isNewPage) {
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    slug = `${slug}-${timestamp}`;
  }

  return slug;
};

export function useConsolidatedPageBuilder() {
  const { pageId } = useParams<{ pageId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { organizationId: contextOrgId, isSubdomainAccess, isContextReady } = useTenantContext();
  
  const urlOrgId = searchParams.get('organization_id');
  const isRootDomain = isMainDomain(window.location.hostname);
  
  // Use organization ID from context (which now includes root domain organization)
  // or fallback to URL parameter for backwards compatibility
  const organizationId = contextOrgId || urlOrgId;
  
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [pageTitle, setPageTitle] = useState(isRootDomain ? 'Home Page' : 'New Page');
  const [pageContent, setPageContent] = useState<any>(createDefaultPuckData());
  const [isPublished, setIsPublished] = useState(false);
  const [isHomepage, setIsHomepage] = useState(isRootDomain ? true : false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  console.log('useConsolidatedPageBuilder: Initializing', {
    pageId,
    organizationId,
    isContextReady,
    isSubdomainAccess,
    isRootDomain,
    hostname: window.location.hostname
  });

  useEffect(() => {
    const loadPageData = async () => {
      if (!isContextReady) return;
      
      // Wait for organization context to be ready
      if (!organizationId) {
        setError('organization_selection_required');
        setIsLoading(false);
        return;
      }

      if (pageId && pageId !== 'new') {
        try {
          console.log('Loading page data for ID:', pageId, 'Org:', organizationId);
          const data = await getPage(pageId);
          if (data) {
            setPageData(data);
            setPageTitle(data.title);
            setPageContent(safeCastToPuckData(data.content));
            setIsPublished(data.published);
            setIsHomepage(data.is_homepage);
            setIsDirty(false);
            console.log('Page data loaded successfully');
          } else {
            // If page not found and it's a new page, create default content
            if (pageId === 'new') {
              const defaultContent = createDefaultPuckData();
              setPageContent(defaultContent);
              setIsHomepage(isRootDomain);
              setPageTitle(isRootDomain ? 'Home Page' : 'New Page');
              setPageData(null); // Explicitly null for new page
              setIsDirty(false);
            } else {
              setError('Page not found');
            }
          }
        } catch (err) {
          console.error('Error loading page:', err);
          setError('Failed to load page');
        }
      } else {
        // New page creation
        const defaultContent = createDefaultPuckData();
        setPageContent(defaultContent);
        setIsHomepage(isRootDomain);
        setPageTitle(isRootDomain ? 'Home Page' : 'New Page');
        setPageData(null);
        setIsDirty(false);
      }
      
      setIsLoading(false);
    };

    loadPageData();
  }, [pageId, organizationId, isContextReady, isRootDomain]);

  const handleSave = useCallback(async () => {
    if (!organizationId) {
      toast.error('No organization selected');
      return;
    }

    setIsSaving(true);
    
    try {
      console.log('Saving page data:', {
        id: pageData?.id,
        title: pageTitle,
        slug: generateValidSlug(pageTitle, !pageId || pageId === 'new'),
        content: pageContent,
        organization_id: organizationId,
        published: isPublished,
        is_homepage: isHomepage,
        show_in_navigation: true
      });

      const dataToSave: PageData = {
        id: pageData?.id,
        title: pageTitle,
        slug: generateValidSlug(pageTitle, !pageId || pageId === 'new'),
        content: pageContent,
        organization_id: organizationId,
        published: isPublished,
        is_homepage: isHomepage,
        show_in_navigation: true
      };

      const savedPageResult = await savePage(dataToSave);
      
      if (savedPageResult) {
        setPageData(savedPageResult);
        setIsDirty(false);
        toast.success('Page saved successfully');
        
        // If this was a new page, update the URL to include the page ID
        if (!pageId || pageId === 'new') {
          const newUrl = `/page-builder/${savedPageResult.id}${isRootDomain ? '' : `?organization_id=${organizationId}`}`;
          navigate(newUrl, { replace: true });
        }
      }
    } catch (error) {
      console.error('Error saving page:', error);
      
      // Handle PageServiceError with specific messages
      if (error && typeof error === 'object' && 'name' in error && error.name === 'PageServiceError') {
        toast.error(error.message || 'Failed to save page');
      } else if (error && typeof error === 'object' && 'message' in error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to save page');
      }
    } finally {
      setIsSaving(false);
    }
  }, [pageData, pageTitle, pageContent, organizationId, isPublished, isHomepage, pageId, navigate, isRootDomain]);

  const handleContentChange = useCallback((newContent: any) => {
    console.log('Page content changed:', newContent);
    setPageContent(newContent);
    setIsDirty(true);
  }, []);

  const handleTitleChange = useCallback((newTitle: string) => {
    setPageTitle(newTitle);
    setIsDirty(true);
  }, []);

  const handlePublishToggle = useCallback(() => {
    setIsPublished(prev => !prev);
    setIsDirty(true);
  }, []);

  const handleHomepageToggle = useCallback(() => {
    setIsHomepage(prev => !prev);
    setIsDirty(true);
  }, []);

  return {
    // Page data
    pageData,
    pageTitle,
    pageContent,
    isPublished,
    isHomepage,
    organizationId,
    
    // State
    isSaving,
    isLoading,
    error,
    isDirty,
    
    // Actions
    handleSave,
    handleContentChange,
    handleTitleChange,
    handlePublishToggle,
    handleHomepageToggle,
    
    // Context info
    isSubdomainAccess,
    isRootDomain
  };
}
