
import React from 'react';
import PuckRenderer from '@/components/pagebuilder/puck/PuckRenderer';
import PublicHomepage from '@/components/public/PublicHomepage';
import SubdomainLayout from './SubdomainLayout';
import { useTenantContext } from '@/components/context/TenantContext';

interface HomepageData {
  id: string;
  title: string;
  content: any;
}

interface SubdomainPageProps {
  homepageData: HomepageData | null;
  adminBarOffset: boolean;
}

const SubdomainPage: React.FC<SubdomainPageProps> = ({ homepageData, adminBarOffset }) => {
  const { organizationId } = useTenantContext();

  // If we have Puck content and organization ID, render with layout
  if (homepageData && organizationId) {
    return (
      <div className={`min-h-screen ${adminBarOffset ? 'pt-12' : ''}`}>
        <SubdomainLayout organizationId={organizationId}>
          <PuckRenderer 
            data={homepageData.content || { content: [], root: {} }}
            className="min-h-screen"
          />
        </SubdomainLayout>
      </div>
    );
  }

  // If we have organization ID but no Puck content, still use layout with fallback
  if (organizationId) {
    return (
      <div className={adminBarOffset ? 'pt-12' : ''}>
        <SubdomainLayout organizationId={organizationId}>
          <PublicHomepage />
        </SubdomainLayout>
      </div>
    );
  }

  // Fallback for cases without organization ID
  return (
    <div className={adminBarOffset ? 'pt-12' : ''}>
      <PublicHomepage />
    </div>
  );
};

export default SubdomainPage;
