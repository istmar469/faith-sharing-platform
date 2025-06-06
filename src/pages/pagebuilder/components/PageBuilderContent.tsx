
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
  onSave: (content: any) => void;
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
  onSave,
  onMobileSettingsChange
}) => {
  if (isMobile) {
    return (
      <div className="h-[calc(100vh-60px)]">
        <PageBuilderEditor
          content={content}
          onContentChange={onContentChange}
          onSave={onSave}
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
    <div className="h-[calc(100vh-120px)] w-full flex">
      {/* Sidebar - Fixed width on desktop */}
      <div className="w-80 flex-shrink-0 border-r border-gray-200 bg-white">
        <PageBuilderSidebar
          title={title}
          published={published}
          isHomepage={isHomepage}
          pageData={pageData}
          onTitleChange={onTitleChange}
          onPublishedChange={onPublishedChange}
          onHomepageChange={onHomepageChange}
        />
      </div>

      {/* Editor - Takes remaining space */}
      <div className="flex-1 min-w-0">
        <PageBuilderEditor
          content={content}
          onContentChange={onContentChange}
          onSave={onSave}
        />
      </div>
    </div>
  );
};

export default PageBuilderContent;
