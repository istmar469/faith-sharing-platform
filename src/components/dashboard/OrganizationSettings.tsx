
import React from 'react';
import { useParams } from 'react-router-dom';
import OrganizationSettingsForm from './settings/OrganizationSettingsForm';
import { useToast } from "@/hooks/use-toast";

type OrganizationSettingsProps = {
  showComingSoonToast?: () => void;
};

const OrganizationSettings: React.FC<OrganizationSettingsProps> = ({ showComingSoonToast }) => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const { toast } = useToast();
  
  // Create a default toast function if none provided
  const handleComingSoonToast = showComingSoonToast || (() => {
    toast({
      title: "Coming Soon",
      description: "This feature is under development",
    });
  });
  
  if (!organizationId) {
    return (
      <div className="text-center py-8">
        <p>No organization selected</p>
      </div>
    );
  }

  return <OrganizationSettingsForm showComingSoonToast={handleComingSoonToast} />;
};

export default OrganizationSettings;
