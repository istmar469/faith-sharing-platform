import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import { toast } from 'sonner';
import { PageData, savePage, getPage } from '@/services/pageService';
import { safeCastToPuckData, createDefaultPuckData } from '@/components/pagebuilder/utils/puckDataHelpers';
import { isMainDomain } from '@/utils/domain/domainDetectionUtils';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';

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

  // For new pages, always add a unique suffix to prevent conflicts
  // This is especially important for common titles like "Home Page"
  if (isNewPage) {
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
    console.warn('Content comparison failed, assuming different:', error);
    return false;
  }
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
  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [pageContent, setPageContent] = useState<any>(createDefaultPuckData());
  const [isPublished, setIsPublished] = useState(false);
  const [isHomepage, setIsHomepage] = useState(false); // Never auto-set as homepage - let page data determine this
  
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

  // Track if this is truly a new page (no ID) vs existing page
  const isNewPage = !pageId || pageId === 'new';
  const isExistingPage = !isNewPage && pageData?.id;

  // Warn user before leaving/refreshing with unsaved changes
  useBeforeUnload({
    when: isDirty,
    message: 'You have unsaved changes to your page. Are you sure you want to leave?'
  });

  console.log('useConsolidatedPageBuilder: Initializing', {
    pageId,
    organizationId,
    isContextReady,
    isSubdomainAccess,
    isRootDomain,
    hostname: window.location.hostname,
    saveStatus,
    isDirty,
    lastSaveTime,
    isNewPage,
    isExistingPage: !!isExistingPage
  });

  // Update document title to show which page is being edited
  useEffect(() => {
    const baseTitle = 'Page Builder';
    if (pageTitle) {
      document.title = `${pageTitle} - ${baseTitle}${isDirty ? ' (unsaved)' : ''}`;
    } else if (isNewPage) {
      document.title = `New Page - ${baseTitle}${isDirty ? ' (unsaved)' : ''}`;
    } else {
      document.title = baseTitle;
    }
    
    // Cleanup: Reset title when component unmounts
    return () => {
      document.title = 'Faith Sharing Platform';
    };
  }, [pageTitle, isDirty, isNewPage]);

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
          console.log('Loading existing page data for ID:', pageId, 'Org:', organizationId);
          const data = await getPage(pageId);
          if (!data) {
            setError('Page not found');
          } else {
            console.log('Page data loaded:', { id: data.id, title: data.title, slug: data.slug, published: data.published });
            setPageData(data);
            setPageTitle(data.title);
            setPageSlug(data.slug);
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
            
            console.log('Existing page loaded successfully');
          }
        } catch (err) {
          console.error('Error loading page:', err);
          setError('Failed to load page');
        }
      } else {
        // New page creation
        console.log('Creating new page');
        const defaultContent = createDefaultPuckData();
        const newPageTitle = isRootDomain ? 'Home Page' : 'New Page';
        const newPageSlug = generateValidSlug(newPageTitle, true); // Always generate unique slug for new pages
        
        setPageContent(defaultContent);
        setLastSavedContent(null);
        // Only set as homepage for truly new pages on root domain, not when editing existing pages
        setIsHomepage(isRootDomain && (!pageId || pageId === 'new'));
        setPageTitle(newPageTitle);
        setPageSlug(newPageSlug);
        setPageData(null);
        setIsDirty(false);
        lastSavedRef.current = null;
        console.log('New page initialized with unique slug:', newPageSlug);
      }
      
      setIsLoading(false);
    };

    loadPageData();
  }, [pageId, organizationId, isContextReady, isRootDomain]);

  const handleSave = useCallback(async (isAutoSave: boolean = false) => {
    if (!organizationId) {
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
        console.log('Auto-save skipped: No real changes detected');
        return;
      }
    }

    // Prevent concurrent saves
    if (isSaving) {
      console.log('Save already in progress, skipping');
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      // For existing pages, always use the current page data ID
      const effectivePageId = isExistingPage ? pageData.id : undefined;
      
      console.log('Saving page data:', {
        id: effectivePageId,
        isNewPage: !effectivePageId,
        isExistingPage: !!effectivePageId,
        title: pageTitle,
        slug: pageSlug || generateValidSlug(pageTitle, !effectivePageId),
        organization_id: organizationId,
        published: isPublished,
        is_homepage: isHomepage,
        show_in_navigation: true,
        isAutoSave
      });

      const dataToSave: PageData = {
        id: effectivePageId,
        title: pageTitle,
        slug: pageSlug || generateValidSlug(pageTitle, !effectivePageId),
        content: pageContent,
        organization_id: organizationId,
        published: isPublished,
        is_homepage: isHomepage,
        show_in_navigation: true
      };

      const savedPageResult = await savePage(dataToSave);
      
      if (savedPageResult) {
        const wasNewPage = !effectivePageId;
        console.log('Page saved successfully:', {
          id: savedPageResult.id,
          wasNewPage,
          title: savedPageResult.title
        });
        
        // Update all relevant state
        setPageData(savedPageResult);
        setPageSlug(savedPageResult.slug); // Update slug in case it was auto-generated or modified by backend
        setLastSavedContent(savedPageResult.content);
        setIsDirty(false);
        setLastSaveTime(new Date());
        setSaveStatus('saved');
        
        // Update the saved reference
        lastSavedRef.current = {
          content: savedPageResult.content,
          title: savedPageResult.title,
          published: savedPageResult.published,
          homepage: savedPageResult.is_homepage
        };
        
        if (wasNewPage) {
          if (savedPageResult.is_homepage) {
            toast.success('Page created and set as homepage successfully');
          } else {
            toast.success('Page created successfully');
          }
          // Update URL to reflect new page ID and slug without full reload
          const newUrl = savedPageResult.slug && savedPageResult.slug !== savedPageResult.id 
            ? `/page-builder/${savedPageResult.id}/${savedPageResult.slug}`
            : `/page-builder/${savedPageResult.id}`;
          navigate(newUrl, { replace: true });
        } else if (!isAutoSave) {
          if (savedPageResult.is_homepage && !lastSavedRef.current?.homepage) {
            toast.success('Page updated and set as homepage');
          } else {
            toast.success('Page updated');
          }
          
          // Update URL if slug has changed for existing pages
          const currentUrl = window.location.pathname;
          const expectedUrl = savedPageResult.slug && savedPageResult.slug !== savedPageResult.id 
            ? `/page-builder/${savedPageResult.id}/${savedPageResult.slug}`
            : `/page-builder/${savedPageResult.id}`;
          
          if (currentUrl !== expectedUrl) {
            navigate(expectedUrl, { replace: true });
          }
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
          const errorMessage = error.message || 'Failed to save page';
          // Make slug error messages more user-friendly
          if (errorMessage.includes('Failed to create page with unique slug')) {
            toast.error('Unable to create page - please try changing the title or refresh the page');
          } else if (errorMessage.includes('A page with this title already exists')) {
            toast.error('A page with this title already exists - please choose a different title');
          } else {
            toast.error(errorMessage);
          }
        } else if (error && typeof error === 'object' && 'message' in error) {
          toast.error(error.message);
        } else {
          toast.error('Failed to save page');
        }
      } else {
        console.error('Auto-save failed:', error);
        // For auto-save failures, just log silently - don't show user-facing errors
        // since the user didn't initiate the save
      }
      
      // Reset error status after a delay
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
      
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [pageData, pageTitle, pageContent, organizationId, isPublished, isHomepage, pageId, navigate, isRootDomain, isExistingPage, isSaving]);

  // Auto-save functionality with debouncing and conflict prevention
  useEffect(() => {
    if (!isDirty || !organizationId || isSaving) return;

    const autoSaveTimeout = setTimeout(() => {
      console.log('useConsolidatedPageBuilder: Auto-saving page');
      handleSave(true); // Pass true for auto-save
    }, 5000); // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(autoSaveTimeout);
  }, [isDirty, organizationId, isSaving, handleSave]);

  const handleContentChange = useCallback((newContent: any) => {
    setPageContent(newContent);
    // Only set dirty if there's a meaningful change from the last saved state
    if (!isContentEqual(newContent, lastSavedContent)) {
      setIsDirty(true);
    }
  }, [lastSavedContent]);

  const handleTitleChange = useCallback((newTitle: string) => {
    console.log('Page title changed:', newTitle);
    setPageTitle(newTitle);
    
    // Auto-generate slug from title if it's a new page or slug is empty
    // But don't regenerate if user has manually set a custom slug
    if (!pageSlug || (isNewPage && pageSlug === '')) {
      const autoSlug = generateValidSlug(newTitle, isNewPage);
      setPageSlug(autoSlug);
      console.log('Auto-generated slug from title:', autoSlug);
    }
    
    setIsDirty(true);
  }, [pageSlug, isNewPage]);

  const handleSlugChange = useCallback((newSlug: string) => {
    console.log('Page slug changed:', newSlug);
    // Ensure slug follows the required format
    const sanitizedSlug = newSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setPageSlug(sanitizedSlug);
    setIsDirty(true);
  }, []);

  const handlePublishToggle = useCallback(() => {
    console.log('Page publish status toggled');
    setIsPublished(prev => !prev);
    setIsDirty(true);
  }, []);

  const handleHomepageToggle = useCallback(() => {
    console.log('Page homepage status toggled');
    setIsHomepage(prev => !prev);
    setIsDirty(true);
  }, []);

  // Handle save from Puck editor publish button
  const handleSaveFromPuck = useCallback((data: any) => {
    console.log('Handling save from Puck editor with data:', data);
    // Update content first
    setPageContent(data);
    setIsDirty(true);
    
    // Then trigger manual save
    setTimeout(() => {
      handleSave(false);
    }, 100);
  }, [handleSave]);

  return {
    // Data
    pageData,
    pageTitle,
    pageSlug,
    pageContent,
    isPublished,
    isHomepage,
    organizationId,
    
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
    handleSaveFromPuck, // Save handler for Puck editor
    handleContentChange,
    handleTitleChange,
    handleSlugChange,
    handlePublishToggle,
    handleHomepageToggle
  };
}
