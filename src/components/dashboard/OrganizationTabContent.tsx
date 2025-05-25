
import React from 'react';
import OrganizationOverview from './OrganizationOverview';
import OrganizationMembers from './OrganizationMembers';
import OrganizationSettings from './OrganizationSettings';
import EventsManagement from '@/components/events/EventsManagement';
import ContactFormTab from './ContactFormTab';

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
    case 'events':
      return <EventsManagement />;
    case 'contact-forms':
      return <ContactFormTab />;
    case 'members':
      return <OrganizationMembers organizationId={organizationId} />;
    case 'settings':
      return <OrganizationSettings organizationId={organizationId} />;
    case 'pages':
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Pages Management</h3>
          <p className="mt-2 text-gray-500">Page management functionality coming soon.</p>
        </div>
      );
    default:
      return <OrganizationOverview organizationId={organizationId} />;
  }
};

export default OrganizationTabContent;
