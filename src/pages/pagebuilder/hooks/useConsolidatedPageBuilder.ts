
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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

  // For new pages or common titles, add a unique suffix to prevent conflicts
  if (isNewPage || slug === 'new-page' || slug === 'untitled-page' || slug === 'home-page') {
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const randomSuffix = Math.random().toString(36).substring(2, 5); // 3 random characters
    slug = `${slug}-${timestamp}-${randomSuffix}`;
  }

  return slug;
};

// Helper function to deep compare content to detect real changes
const isContentEqual = (content1: any, content2: any): boolean => {
  try {
    if (content1 === content2) return true;
    if (!content1 || !content2) return false;
    
    // Normalize content before comparison
    const normalize = (content: any) => {
      if (!content) return { content: [], root: {} };
      return {
        content: Array.isArray(content.content) ? content.content : [],
        root: content.root || {}
      };
    };

    const norm1 = normalize(content1);
    const norm2 = normalize(content2);
    
    return JSON.stringify(norm1) === JSON.stringify(norm2);
  } catch (error) {
    return false;
  }
};

export function useConsolidatedPageBuilder() {
  const { pageId } = useParams<{ pageId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { organizationId: contextOrgId, isSubdomainAccess, isContextReady } = useTenantContext();
  
  const urlOrgId = searchParams.get('organization_id');
  const isRootDomain = useMemo(() => isMainDomain(window.location.hostname), []);
  
  // Use organization ID from context (which now includes root domain organization)
  // or fallback to URL parameter for backwards compatibility
  const organizationId = contextOrgId || urlOrgId;
  
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [pageTitle, setPageTitle] = useState(isRootDomain ? 'Home Page' : 'New Page');
  const [pageContent, setPageContent] = useState<any>(() => createDefaultPuckData());
  const [isPublished, setIsPublished] = useState(false);
  const [isHomepage, setIsHomepage] = useState(isRootDomain ? true : false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState<any>(null);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Use ref to track the last saved state to prevent auto-save conflicts
  const lastSavedRef = useRef<{
    content: any;
    title: string;
    published: boolean;
    homepage: boolean;
  } | null>(null);

  // Prevent re-initialization loop
  const isInitializedRef = useRef(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track if this is truly a new page (no ID) vs existing page
  const isNewPage = !pageId || pageId === 'new';
  const isExistingPage = !isNewPage && pageData?.id;

  // Memoize stable values to prevent unnecessary re-renders
  const stablePageId = useMemo(() => pageId, [pageId]);
  const stableOrganizationId = useMemo(() => organizationId, [organizationId]);

  useEffect(() => {
    // Prevent multiple initializations
    if (!isContextReady || isInitializedRef.current) return;
    
    const loadPageData = async () => {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      // Wait for organization context to be ready
      if (!stableOrganizationId) {
        setError('organization_selection_required');
        setIsLoading(false);
        return;
      }

      if (stablePageId && stablePageId !== 'new') {
        try {
          const data = await getPage(stablePageId);
          if (!data) {
            setError('Page not found');
          } else {
            setPageData(data);
            setPageTitle(data.title);
            const safeContent = safeCastToPuckData(data.content);
            setPageContent(safeContent);
            setLastSavedContent(safeContent);
            setIsPublished(data.published);
            setIsHomepage(data.is_homepage);
            setIsDirty(false);
            
            // Update the saved reference
            lastSavedRef.current = {
              content: safeContent,
              title: data.title,
              published: data.published,
              homepage: data.is_homepage
            };
          }
        } catch (err) {
          console.error('Error loading page:', err);
          setError('Failed to load page');
        }
      } else {
        // New page creation
        const defaultContent = createDefaultPuckData();
        setPageContent(defaultContent);
        setLastSavedContent(null);
        setIsHomepage(isRootDomain);
        setPageTitle(isRootDomain ? 'Home Page' : 'New Page');
        setPageData(null);
        setIsDirty(false);
        lastSavedRef.current = null;
      }
      
      setIsLoading(false);
      isInitializedRef.current = true;
    };

    // Use timeout to prevent rapid re-initialization
    loadingTimeoutRef.current = setTimeout(loadPageData, 100);

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [stablePageId, stableOrganizationId, isContextReady, isRootDomain]);

  const handleSave = useCallback(async (isAutoSave: boolean = false) => {
    if (!stableOrganizationId) {
      if (!isAutoSave) {
        toast.error('No organization selected');
        setSaveStatus('error');
      }
      return;
    }

    if (!pageTitle.trim()) {
      if (!isAutoSave) {
        toast.error('Page title is required');
        setSaveStatus('error');
      }
      return;
    }

    // For auto-save, check if we really have changes to prevent unnecessary saves
    if (isAutoSave && lastSavedRef.current) {
      const hasRealChanges = (
        !isContentEqual(pageContent, lastSavedRef.current.content) ||
        pageTitle !== lastSavedRef.current.title ||
        isPublished !== lastSavedRef.current.published ||
        isHomepage !== lastSavedRef.current.homepage
      );
      
      if (!hasRealChanges) {
        return;
      }
    }

    // Prevent concurrent saves
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      // For existing pages, always use the current page data ID
      const effectivePageId = isExistingPage ? pageData.id : undefined;
      
      const dataToSave: PageData = {
        id: effectivePageId,
        title: pageTitle,
        slug: pageData?.slug || generateValidSlug(pageTitle, !effectivePageId),
        content: pageContent,
        organization_id: stableOrganizationId,
        published: isPublished,
        is_homepage: isHomepage,
        show_in_navigation: true
      };

      const savedPageResult = await savePage(dataToSave);
      
      if (savedPageResult) {
        const wasNewPage = !effectivePageId;
        
        // Update all relevant state
        setPageData(savedPageResult);
        setLastSavedContent(pageContent);
        setIsDirty(false);
        setLastSaveTime(new Date());
        setSaveStatus('saved');
        
        // Update the saved reference
        lastSavedRef.current = {
          content: pageContent,
          title: pageTitle,
          published: isPublished,
          homepage: isHomepage
        };
        
        if (!isAutoSave) {
          toast.success('Page saved successfully');
        }
        
        // If this was a new page, update the URL to include the page ID
        if (wasNewPage) {
          const newUrl = `/page-builder/${savedPageResult.id}${isRootDomain ? '' : `?organization_id=${stableOrganizationId}`}`;
          navigate(newUrl, { replace: true });
        }

        // Reset save status after a short delay to show "saved" state
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);

        return savedPageResult;
      } else {
        throw new Error('Save operation returned no data');
      }
    } catch (error: any) {
      console.error('Error saving page:', error);
      setSaveStatus('error');
      
      if (!isAutoSave) {
        // Handle PageServiceError with specific messages
        if (error && typeof error === 'object' && 'name' in error && error.name === 'PageServiceError') {
          toast.error(error.message || 'Failed to save page');
        } else if (error && typeof error === 'object' && 'message' in error) {
          toast.error(error.message);
        } else {
          toast.error('Failed to save page');
        }
      }
      
      // Reset error status after a delay
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
      
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [pageData, pageTitle, pageContent, stableOrganizationId, isPublished, isHomepage, navigate, isRootDomain, isExistingPage, isSaving]);

  // Auto-save functionality with debouncing and conflict prevention
  useEffect(() => {
    if (!isDirty || !stableOrganizationId || isSaving || !isInitializedRef.current) return;

    const autoSaveTimeout = setTimeout(() => {
      handleSave(true); // Pass true for auto-save
    }, 5000); // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(autoSaveTimeout);
  }, [isDirty, stableOrganizationId, isSaving, handleSave]);

  // Memoize and debounce content change handler
  const handleContentChange = useCallback((newContent: any) => {
    // Prevent unnecessary updates if content is actually the same
    if (isContentEqual(newContent, pageContent)) {
      return;
    }
    
    setPageContent(newContent);
    
    // Check if content actually changed using deep comparison
    const contentChanged = !isContentEqual(newContent, lastSavedContent);
    if (contentChanged) {
      setIsDirty(true);
    }
  }, [pageContent, lastSavedContent]);

  const handleTitleChange = useCallback((newTitle: string) => {
    if (newTitle === pageTitle) return;
    setPageTitle(newTitle);
    setIsDirty(true);
  }, [pageTitle]);

  const handlePublishToggle = useCallback(() => {
    setIsPublished(prev => !prev);
    setIsDirty(true);
  }, []);

  const handleHomepageToggle = useCallback(() => {
    setIsHomepage(prev => !prev);
    setIsDirty(true);
  }, []);

  return {
    // Data
    pageData,
    pageTitle,
    pageContent,
    isPublished,
    isHomepage,
    organizationId: stableOrganizationId,
    
    // State
    isSaving,
    isLoading,
    error,
    isDirty,
    isSubdomainAccess,
    isRootDomain,
    saveStatus,
    lastSaveTime,
    
    // Actions
    handleSave: () => handleSave(false), // Explicit manual save
    handleContentChange,
    handleTitleChange,
    handlePublishToggle,
    handleHomepageToggle
  };
}
