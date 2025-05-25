
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTenantContext } from '@/components/context/TenantContext';

export const useDashboardNavigation = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isSubdomainAccess } = useTenantContext();

  const handleCreateEvent = () => {
    setActiveTab('events');
  };

  const handleViewMembers = () => {
    setActiveTab('members');
  };

  const handleViewDonations = () => {
    toast({
      title: "Coming Soon",
      description: "Donation tracking will be available soon",
    });
  };

  const handleOpenSiteEditor = (organizationId: string) => {
    // Navigate to page builder with organization context
    if (isSubdomainAccess) {
      navigate('/page-builder');
    } else {
      navigate(`/page-builder?org=${organizationId}`);
    }
  };

  const handleWebsiteTab = () => {
    setActiveTab('website');
  };

  return {
    activeTab,
    setActiveTab,
    handleCreateEvent,
    handleViewMembers,
    handleViewDonations,
    handleOpenSiteEditor,
    handleWebsiteTab
  };
};
