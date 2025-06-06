
import React from 'react';
import { useTenantContext } from '@/components/context/TenantContext';
import SubdomainLayout from './SubdomainLayout';

interface SubdomainPageProps {
  homepageData?: any;
  availablePages?: any[];
  adminBarOffset: boolean;
  error?: string | null;
}

const SubdomainPage: React.FC<SubdomainPageProps> = ({ 
  homepageData, 
  availablePages = [], 
  adminBarOffset,
  error 
}) => {
  const { organizationId } = useTenantContext();

  if (!organizationId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Organization Not Found</h1>
          <p className="text-gray-600">
            The organization you're looking for could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <SubdomainLayout organizationId={organizationId}>
      <div className={`${adminBarOffset ? 'pt-12' : ''}`}>
        {error ? (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-red-600 mb-6">
                Error Loading Page
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {error}
              </p>
            </div>
          </div>
        ) : homepageData ? (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {homepageData.title}
            </h1>
            <div className="prose max-w-none">
              {/* Render homepage content here */}
              {homepageData.content && (
                <div dangerouslySetInnerHTML={{ __html: homepageData.content }} />
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                Welcome
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                This website is being set up. Please check back soon!
              </p>
              
              {availablePages.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Available Pages
                  </h2>
                  <div className="grid gap-4 max-w-md mx-auto">
                    {availablePages.map((page) => (
                      <a
                        key={page.id}
                        href={`/${page.slug}`}
                        className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <h3 className="font-medium text-gray-900">{page.title}</h3>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SubdomainLayout>
  );
};

export default SubdomainPage;
