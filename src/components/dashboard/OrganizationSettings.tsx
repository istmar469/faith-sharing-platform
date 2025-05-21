
import React from 'react';
import { useParams } from 'react-router-dom';
import OrganizationSettingsForm from './settings/OrganizationSettingsForm';

type OrganizationSettingsProps = {
  showComingSoonToast: () => void;
};

const OrganizationSettings: React.FC<OrganizationSettingsProps> = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  
  if (!organizationId) {
    return (
      <div className="text-center py-8">
        <p>No organization selected</p>
      </div>
    );
  }

  return <OrganizationSettingsForm />;
};

export default OrganizationSettings;
