
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useDashboardNavigation = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const handleCreateEvent = () => {
    setActiveTab('church');
  };

  const handleViewMembers = () => {
    toast({
      title: "Coming Soon",
      description: "Member management will be available soon",
    });
  };

  const handleViewDonations = () => {
    toast({
      title: "Coming Soon",
      description: "Donation tracking will be available soon",
    });
  };

  return {
    activeTab,
    setActiveTab,
    handleCreateEvent,
    handleViewMembers,
    handleViewDonations
  };
};
