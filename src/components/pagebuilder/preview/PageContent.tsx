
import React from 'react';
import { Page } from "@/services/pages";
import PageElement from '../elements/PageElement';
import { Helmet } from 'react-helmet';

interface PageContentProps {
  page: Page;
}

const PageContent = ({ page }: PageContentProps) => {
  return (
    <>
      <Helmet>
        <title>{page.meta_title || page.title}</title>
        {page.meta_description && <meta name="description" content={page.meta_description} />}
      </Helmet>
      
      <div className="min-h-screen bg-white">
        <div className="mx-auto">
          {page.content?.map((element) => (
            <PageElement
              key={element.id}
              element={element}
              isSelected={false}
              onClick={() => {}} // No editing on the preview
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default PageContent;
