import React, { useEffect, useState, useCallback } from 'react';
import { useOrgApi } from '@/hooks/useOrgApi'; // New Hook
import { useTenantContext } from '@/components/context/TenantContext'; // Still needed for isContextReady

// Define a type for page data for better type safety, assuming it might be used elsewhere
// If only used here, can be inline.
interface Page {
  id: string;
  title: string;
  content: string;
  organization_id: string; // This will be set by the hook when saving
}

// Type for new page data, id and organization_id are optional or not needed for creation
type NewPageData = Omit<Page, 'id' | 'organization_id'> & { id?: string };


const PagesManager: React.FC = () => {
  const { isContextReady, organizationId: contextOrgId } = useTenantContext(); // Used to trigger useEffect and for initial check
  const { getPages, savePage, isContextReady: apiIsContextReady, organizationId: apiOrgId } = useOrgApi(); // New API hook
  
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = useCallback(async () => {
    if (!apiIsContextReady || !apiOrgId) {
      // The hook's methods will throw errors, but we can also check here
      // to prevent calls if the context isn't ready from useOrgApi's perspective.
      // This is useful if we want to avoid even attempting the call.
      // setError("API context not ready or organization ID missing from useOrgApi.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: apiError } = await getPages();
      if (apiError) {
        setError(apiError.message);
        setPages([]);
      } else {
        setPages(data || []);
      }
    } catch (err: any) {
      setError(err.message);
      setPages([]);
    } finally {
      setIsLoading(false);
    }
  }, [getPages, apiIsContextReady, apiOrgId]); // Dependencies for useCallback

  useEffect(() => {
    // Trigger fetchPages when the component mounts and context (from useTenantContext) is ready.
    // The actual organizationId for the API call will come from useOrgApi.
    if (isContextReady && contextOrgId) {
      fetchPages();
    } else if (isContextReady && !contextOrgId) {
      setError("Organization ID not found in TenantContext. Cannot fetch pages.");
      setPages([]);
      setIsLoading(false);
    }
    // Not adding fetchPages to dependency array if it's stable due to useCallback
    // or if its own dependencies (getPages, apiIsContextReady, apiOrgId) are stable.
  }, [isContextReady, contextOrgId, fetchPages]);


  const handleSavePage = async (pageData: NewPageData) => {
    // No need to check for organizationId here, savePage from useOrgApi will do it.
    setIsLoading(true);
    setError(null);
    try {
      const { data: savedPage, error: apiError } = await savePage(pageData);
      if (apiError) {
        setError(apiError.message);
      } else if (savedPage) {
        // Refresh pages list
        // Alternatively, update the state directly if the backend returns the full object
        // For example: setPages(prevPages => prevPages.map(p => p.id === savedPage.id ? savedPage : p));
        // If it's a new page: setPages(prevPages => [...prevPages, savedPage]);
        // For simplicity, refetching:
        await fetchPages(); 
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // isContextReady from useTenantContext is a good general "is the overall app ready" check
  if (!isContextReady) return <p>Loading context...</p>; 
  if (isLoading) return <p>Loading pages...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
      <h1>Pages Manager (New useOrgApi Hook Example)</h1>
      <button onClick={() => handleSavePage({ title: 'New Page via Hook', content: 'Some content via hook' })}>
        Add Test Page via Hook
      </button>
      <ul>
        {pages.map(page => (
          <li key={page.id}>{page.title}</li>
        ))}
        {pages.length === 0 && !isLoading && <p>No pages found.</p>}
      </ul>
    </div>
  );
};

export default PagesManager;
