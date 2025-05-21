
import React from 'react';
import { Page } from "@/services/pages";
import PageElement from '../elements/PageElement';

interface PageContentProps {
  page: Page;
}

const PageContent = ({ page }: PageContentProps) => {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto">
        {page.content?.map((element) => (
          <PageElement
            key={element.id}
            element={element}
            isSelected={false}
            onClick={() => {}} // No editing on the front-end
          />
        ))}
      </div>
    </div>
  );
};

export default PageContent;
