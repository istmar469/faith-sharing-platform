
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getPage } from '@/services/pageService';
import { PageData } from '@/services/pageService';
import { Loader2, AlertCircle, Edit, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Render } from '@measured/puck';
import { puckConfig } from '@/components/pagebuilder/puck/config/PuckConfig';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import '@/index.css';
import '@/App.css';
import '@measured/puck/puck.css';

const PreviewPage: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStatus();

  const isPreview = searchParams.get('preview') === 'true';
  const orgId = searchParams.get('org');

  useEffect(() => {
    console.log('PreviewPage: pageId from params:', pageId);
    console.log('PreviewPage: isPreview:', isPreview);
    console.log('PreviewPage: orgId:', orgId);
    
    // Handle live preview data from localStorage
    const livePreviewDataString = localStorage.getItem('livePreviewData');
    if (isPreview && livePreviewDataString) {
      try {
        const livePreviewData = JSON.parse(livePreviewDataString);
        if (livePreviewData && livePreviewData.content && livePreviewData.root && livePreviewData.title) {
          setPage({
            id: 'live-preview',
            title: livePreviewData.title,
            slug: 'live-preview',
            content: { content: livePreviewData.content, root: livePreviewData.root },
            organization_id: orgId || '',
            published: true,
            show_in_navigation: false,
            is_homepage: false,
          });
          setLoading(false);
          localStorage.removeItem('livePreviewData');
          return;
        } else {
          console.warn('Live preview data from localStorage is not in the expected format.');
          localStorage.removeItem('livePreviewData');
        }
      } catch (e) {
        console.error('Failed to parse live preview data from localStorage:', e);
        localStorage.removeItem('livePreviewData');
      }
    }

    // Check if pageId is valid
    if (!pageId || pageId === ':pageId' || pageId.includes(':')) {
      console.error('PreviewPage: Invalid pageId detected:', pageId);
      if (!isPreview) {
        setError('Invalid page ID. Please check the URL and try again.');
        setLoading(false);
        return;
      } else {
        setError('Live preview data not found. Please try previewing again from the editor.');
        setLoading(false);
        return;
      }
    }

    if (pageId && !isPreview) {
      const loadPage = async () => {
        try {
          console.log('PreviewPage: Loading page with ID:', pageId);
          const pageData = await getPage(pageId);
          if (!pageData) {
            setError('Page not found');
          } else {
            console.log('PreviewPage: Page loaded successfully:', pageData);
            setPage(pageData);
          }
        } catch (err: any) {
          console.error('Error loading page:', err);
          setError('Failed to load page: ' + (err.message || 'Unknown error'));
        } finally {
          setLoading(false);
        }
      };
      loadPage();
    }
  }, [pageId, isPreview, orgId]);

  const handleEditPage = () => {
    if (page?.id && page?.id !== 'live-preview') {
      const editUrl = orgId 
        ? `/page-builder/${page.id}?org=${orgId}`
        : `/page-builder/${page.id}`;
      window.location.href = editUrl;
    }
  };

  const handleBackToDashboard = () => {
    if (orgId) {
      window.location.href = `/dashboard?org=${orgId}`;
    } else {
      window.location.href = '/dashboard';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading page...</span>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The requested page could not be found.'}</p>
          {isAuthenticated && (
            <Button onClick={handleBackToDashboard} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Bar for Authenticated Users */}
      {isAuthenticated && (
        <div className="bg-slate-900 text-white px-4 py-2 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Preview Mode</span>
            <span className="text-xs bg-slate-700 px-2 py-1 rounded">
              {page?.title || 'Page'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm"
              variant="secondary"
              onClick={handleBackToDashboard}
              className="flex items-center gap-1 bg-slate-700 text-white hover:bg-slate-600"
            >
              <ArrowLeft className="h-3 w-3" />
              Dashboard
            </Button>
            {page?.id !== 'live-preview' && (
              <Button 
                size="sm"
                variant="secondary"
                onClick={handleEditPage}
                className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700"
              >
                <Edit className="h-3 w-3" />
                Edit Page
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Preview Notice */}
      {isPreview && (
        <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2">
          <p className="text-sm text-yellow-800 text-center">
            🔍 Preview Mode - This is how your page will look to visitors
          </p>
        </div>
      )}
      
      {/* Page Content */}
      <div className={isAuthenticated ? "pt-0" : ""}>
        <div className="min-h-screen">
          {page.content ? (
            <Render config={puckConfig} data={page.content} />
          ) : (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center py-10">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No content available for this page.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
