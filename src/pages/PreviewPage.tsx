import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getPage } from '@/services/pageService';
import { PageData } from '@/services/pageService';
import { Loader2, AlertCircle } from 'lucide-react';
import { Render } from '@measured/puck';
import { puckConfig } from '@/components/pagebuilder/puck/config/PuckConfig';
import '@/index.css';
import '@/App.css';
import '@measured/puck/puck.css';

const PreviewPage: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPreview = searchParams.get('preview') === 'true';

  useEffect(() => {
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
            organization_id: '',
            published: true,
            show_in_navigation: false,
            is_homepage: false,
          });
          setLoading(false);
          localStorage.removeItem('livePreviewData');
          return;
        } else {
          console.warn('Live preview data from localStorage is not in the expected PuckData format.');
          localStorage.removeItem('livePreviewData');
        }
      } catch (e) {
        console.error('Failed to parse live preview data from localStorage:', e);
        localStorage.removeItem('livePreviewData');
      }
    }

    if (!pageId && !isPreview) {
      setError('No page ID provided and not a live preview.');
      setLoading(false);
      return;
    } else if (!pageId && isPreview) {
      setError('Live preview data not found. Please try previewing again from the editor.');
      setLoading(false);
      return;
    }

    if (pageId) {
      const loadPage = async () => {
        try {
          const pageData = await getPage(pageId);
          if (!pageData) {
            setError('Page not found');
          } else {
            setPage(pageData);
          }
        } catch (err: any) {
          console.error('Error loading page:', err);
          setError('Failed to load page');
        } finally {
          setLoading(false);
        }
      };
      loadPage();
    }
  }, [pageId, isPreview, searchParams]);

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
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600">{error || 'The requested page could not be found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isPreview && (
        <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2">
          <p className="text-sm text-yellow-800 text-center">
            🔍 Preview Mode - This is how your page will look to visitors
          </p>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto py-8 px-4">
        <article className="bg-white rounded-lg shadow-sm p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{page.title}</h1>
            {page.meta_description && (
              <p className="text-lg text-gray-600">{page.meta_description}</p>
            )}
          </header>
          
          <div className="prose prose-lg max-w-none">
            {page.content ? (
              <Render config={puckConfig} data={page.content} />
            ) : (
              <div className="text-center py-10">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No content available for this page.</p>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
};

export default PreviewPage;
