
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useDashboardNavigation = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

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
    // Open site editor in new tab with organization context
    window.open(`/page-builder?org=${organizationId}`, '_blank');
  };

  return {
    activeTab,
    setActiveTab,
    handleCreateEvent,
    handleViewMembers,
    handleViewDonations,
    handleOpenSiteEditor
  };
};
