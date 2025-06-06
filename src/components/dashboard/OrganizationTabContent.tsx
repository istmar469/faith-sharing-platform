import React from 'react';
import OrganizationOverview from './OrganizationOverview';
import OrganizationMembers from './OrganizationMembers';
import OrganizationSettings from './OrganizationSettings';
import EventsManagement from '@/components/events/EventsManagement';
import ContactFormTab from './ContactFormTab';
import WebsiteTabContent from './components/WebsiteTabContent';
import PagesManagement from './components/PagesManagement';
import SiteSettings from './components/SiteSettings';

interface OrganizationTabContentProps {
  activeTab: string;
  organizationId: string;
}

const OrganizationTabContent: React.FC<OrganizationTabContentProps> = ({
  activeTab,
  organizationId,
}) => {
  switch (activeTab) {
    case 'overview':
      return <OrganizationOverview organizationId={organizationId} />;
    case 'website':
      return <WebsiteTabContent organizationId={organizationId} />;
    case 'events':
      return <EventsManagement />;
    case 'contact-forms':
      return <ContactFormTab />;
    case 'members':
      return <OrganizationMembers organizationId={organizationId} />;
    case 'settings':
      return <OrganizationSettings organizationId={organizationId} />;
    case 'pages':
      return <PagesManagement organizationId={organizationId} />;
    case 'site-settings':
      return <SiteSettings />;
    default:
      return <OrganizationOverview organizationId={organizationId} />;
  }
};

export default OrganizationTabContent;
