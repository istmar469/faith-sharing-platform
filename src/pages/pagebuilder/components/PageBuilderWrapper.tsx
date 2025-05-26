
import React from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { PageData } from '@/services/pageService';
import PageBuilderHeader from '../PageBuilderHeader';
import MobilePageBuilderHeader from '@/components/pagebuilder/components/MobilePageBuilderHeader';
import PageBuilderContent from './PageBuilderContent';

interface PageBuilderWrapperProps {
  organizationId: string | null;
  isSubdomainAccess: boolean;
  title: string;
  published: boolean;
  isHomepage: boolean;
  content: any;
  pageData: PageData | null;
  isSaving: boolean;
  isPublishing: boolean;
  showMobileSettings: boolean;
  onTitleChange: (title: string) => void;
  onPublishedChange: (published: boolean) => void;
  onHomepageChange: (isHomepage: boolean) => void;
  onContentChange: (content: any) => void;
  onSave: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onPreview: () => void;
  onBackToDashboard: () => void;
  onMobileSettingsChange: (show: boolean) => void;
}

const PageBuilderWrapper: React.FC<PageBuilderWrapperProps> = ({
  organizationId,
  isSubdomainAccess,
  title,
  published,
  isHomepage,
  content,
  pageData,
  isSaving,
  isPublishing,
  showMobileSettings,
  onTitleChange,
  onPublishedChange,
  onHomepageChange,
  onContentChange,
  onSave,
  onPublish,
  onUnpublish,
  onPreview,
  onBackToDashboard,
  onMobileSettingsChange
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header - Mobile vs Desktop */}
      {isMobile ? (
        <MobilePageBuilderHeader
          organizationId={organizationId}
          isSubdomainAccess={isSubdomainAccess}
          title={title}
          published={published}
          isSaving={isSaving}
          isPublishing={isPublishing}
          onSave={onSave}
          onPublish={onPublish}
          onUnpublish={onUnpublish}
          onPreview={onPreview}
          onSettingsOpen={() => onMobileSettingsChange(true)}
        />
      ) : (
        <PageBuilderHeader
          organizationId={organizationId}
          isSubdomainAccess={isSubdomainAccess}
          title={title}
          published={published}
          isSaving={isSaving}
          isPublishing={isPublishing}
          onSave={onSave}
          onPublish={onPublish}
          onUnpublish={onUnpublish}
          onPreview={onPreview}
          onBackToDashboard={onBackToDashboard}
        />
      )}
      
      <PageBuilderContent
        isMobile={isMobile}
        title={title}
        published={published}
        isHomepage={isHomepage}
        content={content}
        pageData={pageData}
        showMobileSettings={showMobileSettings}
        onTitleChange={onTitleChange}
        onPublishedChange={onPublishedChange}
        onHomepageChange={onHomepageChange}
        onContentChange={onContentChange}
        onMobileSettingsChange={onMobileSettingsChange}
      />
    </div>
  );
};

export default PageBuilderWrapper;
