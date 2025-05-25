
import React from 'react';
import PuckRenderer from '@/components/pagebuilder/puck/PuckRenderer';
import PublicHomepage from '@/components/public/PublicHomepage';

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
  if (homepageData) {
    return (
      <div className={`min-h-screen ${adminBarOffset ? 'pt-12' : ''}`}>
        <PuckRenderer 
          data={homepageData.content || { content: [], root: {} }}
          className="min-h-screen"
        />
      </div>
    );
  }

  return (
    <div className={adminBarOffset ? 'pt-12' : ''}>
      <PublicHomepage />
    </div>
  );
};

export default SubdomainPage;
