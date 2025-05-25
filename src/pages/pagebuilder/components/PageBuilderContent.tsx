
import React from 'react';
import { PageData } from '@/services/pageService';
import PageBuilderSidebar from '../PageBuilderSidebar';
import MobilePageSettings from '@/components/pagebuilder/components/MobilePageSettings';
import PageBuilderEditor from '../PageBuilderEditor';

interface PageBuilderContentProps {
  isMobile: boolean;
  title: string;
  published: boolean;
  isHomepage: boolean;
  content: any;
  pageData: PageData | null;
  showMobileSettings: boolean;
  onTitleChange: (title: string) => void;
  onPublishedChange: (published: boolean) => void;
  onHomepageChange: (isHomepage: boolean) => void;
  onContentChange: (content: any) => void;
  onMobileSettingsChange: (show: boolean) => void;
}

const PageBuilderContent: React.FC<PageBuilderContentProps> = ({
  isMobile,
  title,
  published,
  isHomepage,
  content,
  pageData,
  showMobileSettings,
  onTitleChange,
  onPublishedChange,
  onHomepageChange,
  onContentChange,
  onMobileSettingsChange
}) => {
  if (isMobile) {
    return (
      <div className="h-[calc(100vh-60px)]">
        <PageBuilderEditor
          content={content}
          onContentChange={onContentChange}
        />
        
        {/* Mobile Settings Panel */}
        <MobilePageSettings
          open={showMobileSettings}
          onOpenChange={onMobileSettingsChange}
          title={title}
          published={published}
          isHomepage={isHomepage}
          pageData={pageData}
          onTitleChange={onTitleChange}
          onPublishedChange={onPublishedChange}
          onHomepageChange={onHomepageChange}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
      <PageBuilderSidebar
        title={title}
        published={published}
        isHomepage={isHomepage}
        pageData={pageData}
        onTitleChange={onTitleChange}
        onPublishedChange={onPublishedChange}
        onHomepageChange={onHomepageChange}
      />

      <PageBuilderEditor
        content={content}
        onContentChange={onContentChange}
      />
    </div>
  );
};

export default PageBuilderContent;
