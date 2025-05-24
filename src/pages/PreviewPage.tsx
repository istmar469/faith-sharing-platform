
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getPage } from '@/services/pageService';
import { PageData } from '@/services/pageService';
import { Loader2, AlertCircle } from 'lucide-react';

const PreviewPage: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPreview = searchParams.get('preview') === 'true';

  useEffect(() => {
    if (!pageId) {
      setError('No page ID provided');
      setLoading(false);
      return;
    }

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
  }, [pageId]);

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

  const renderContent = (content: any) => {
    if (!content || !content.blocks) {
      return <p>No content available</p>;
    }

    return content.blocks.map((block: any, index: number) => {
      switch (block.type) {
        case 'header':
          const HeaderTag = `h${block.data.level || 2}` as keyof JSX.IntrinsicElements;
          return (
            <HeaderTag key={index} className="mb-4 font-bold">
              {block.data.text}
            </HeaderTag>
          );
        case 'paragraph':
          return (
            <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: block.data.text }} />
          );
        case 'list':
          const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
          return (
            <ListTag key={index} className="mb-4 ml-6">
              {block.data.items.map((item: string, itemIndex: number) => (
                <li key={itemIndex} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ListTag>
          );
        case 'quote':
          return (
            <blockquote key={index} className="mb-4 pl-4 border-l-4 border-gray-300 italic">
              <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
              {block.data.caption && (
                <cite className="block mt-2 text-sm text-gray-600">— {block.data.caption}</cite>
              )}
            </blockquote>
          );
        case 'delimiter':
          return <hr key={index} className="my-8 border-gray-300" />;
        case 'checklist':
          return (
            <ul key={index} className="mb-4">
              {block.data.items.map((item: any, itemIndex: number) => (
                <li key={itemIndex} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    readOnly
                    className="mr-2"
                  />
                  <span dangerouslySetInnerHTML={{ __html: item.text }} />
                </li>
              ))}
            </ul>
          );
        default:
          return <div key={index} className="mb-4">Unsupported block type: {block.type}</div>;
      }
    });
  };

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
            {renderContent(page.content)}
          </div>
        </article>
      </div>
    </div>
  );
};

export default PreviewPage;
