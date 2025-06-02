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

  // For new pages or common titles, add a unique suffix to prevent conflicts
  if (isNewPage || slug === 'new-page' || slug === 'untitled-page' || slug === 'home-page') {
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const randomSuffix = Math.random().toString(36).substring(2, 5); // 3 random characters
    slug = `${slug}-${timestamp}-${randomSuffix}`;
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
  const [lastSavedContent, setLastSavedContent] = useState<any>(null);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  console.log('useConsolidatedPageBuilder: Initializing', {
    pageId,
    organizationId,
    isContextReady,
    isSubdomainAccess,
    isRootDomain,
    hostname: window.location.hostname,
    saveStatus,
    isDirty,
    lastSaveTime
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
            console.log('Page data loaded:', data);
            setPageData(data);
            setPageTitle(data.title);
            const safeContent = safeCastToPuckData(data.content);
            setPageContent(safeContent);
            setLastSavedContent(safeContent); // Track what was last saved
            setIsPublished(data.published);
            setIsHomepage(data.is_homepage);
            setIsDirty(false);
            console.log('Page data loaded successfully');
          } else {
            // If page not found, check if it's a new page
            if (pageId === 'new') {
              const defaultContent = createDefaultPuckData();
              setPageContent(defaultContent);
              setLastSavedContent(null);
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
        setLastSavedContent(null);
        setIsHomepage(isRootDomain);
        setPageTitle(isRootDomain ? 'Home Page' : 'New Page');
        setPageData(null);
        setIsDirty(false);
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

    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      console.log('Saving page data:', {
        id: pageData?.id,
        title: pageTitle,
        slug: pageData?.slug || generateValidSlug(pageTitle, !pageData?.id),
        content: pageContent,
        organization_id: organizationId,
        published: isPublished,
        is_homepage: isHomepage,
        show_in_navigation: true,
        isAutoSave
      });

      const dataToSave: PageData = {
        id: pageData?.id,
        title: pageTitle,
        slug: pageData?.slug || generateValidSlug(pageTitle, !pageData?.id),
        content: pageContent,
        organization_id: organizationId,
        published: isPublished,
        is_homepage: isHomepage,
        show_in_navigation: true
      };

      const savedPageResult = await savePage(dataToSave);
      
      if (savedPageResult) {
        console.log('Page saved successfully:', savedPageResult);
        
        // Update all relevant state
        setPageData(savedPageResult);
        setLastSavedContent(pageContent); // Track what was saved
        setIsDirty(false); // Mark as clean
        setLastSaveTime(new Date());
        setSaveStatus('saved');
        
        if (!isAutoSave) {
          toast.success('Page saved successfully');
        } else {
          console.log('Auto-save completed successfully');
        }
        
        // If this was a new page, update the URL to include the page ID
        if (!pageId || pageId === 'new') {
          const newUrl = `/page-builder/${savedPageResult.id}${isRootDomain ? '' : `?organization_id=${organizationId}`}`;
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
      } else {
        console.error('Auto-save failed:', error);
      }
      
      // Reset error status after a delay
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
      
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [pageData, pageTitle, pageContent, organizationId, isPublished, isHomepage, pageId, navigate, isRootDomain]);

  // Auto-save functionality with debouncing
  useEffect(() => {
    if (!isDirty || !organizationId || isSaving) return;

    const autoSaveTimeout = setTimeout(() => {
      console.log('useConsolidatedPageBuilder: Auto-saving page');
      handleSave(true); // Pass true for auto-save
    }, 5000); // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(autoSaveTimeout);
  }, [isDirty, organizationId, isSaving, handleSave]);

  const handleContentChange = useCallback((newContent: any) => {
    console.log('Page content changed:', newContent);
    setPageContent(newContent);
    
    // Check if content actually changed to avoid unnecessary dirty state
    const contentChanged = JSON.stringify(newContent) !== JSON.stringify(lastSavedContent);
    if (contentChanged) {
      setIsDirty(true);
    }
  }, [lastSavedContent]);

  const handleTitleChange = useCallback((newTitle: string) => {
    console.log('Page title changed:', newTitle);
    setPageTitle(newTitle);
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

  return {
    // Data
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
