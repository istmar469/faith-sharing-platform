
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import DashboardSidebar from './DashboardSidebar';
import OrganizationHeader from './OrganizationHeader';
import OrganizationLoading from './OrganizationLoading';
import OrganizationError from './OrganizationError';
import LoginDialog from '../auth/LoginDialog';
import OrganizationTabContent from './OrganizationTabContent';
import { useOrganizationData } from './hooks/useOrganizationData';
import { useAuthCheck } from './hooks/useAuthCheck';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const OrganizationDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Use custom hooks for data and authentication
  const {
    organization,
    isLoading,
    error,
    availableOrgs,
    handleWebsiteToggle,
    fetchOrganizationDetails
  } = useOrganizationData();
  
  const {
    loginDialogOpen,
    setLoginDialogOpen,
    isCheckingAuth
  } = useAuthCheck();
  
  const showComingSoonToast = () => {
    toast({
      title: "Coming Soon",
      description: "This feature is under development",
    });
  };
  
  const handleRetry = () => {
    fetchOrganizationDetails();
  };
  
  if (isLoading || isCheckingAuth) {
    return <OrganizationLoading />;
  }
  
  if (loginDialogOpen) {
    return (
      <>
        <div className="flex h-screen items-center justify-center bg-white">
          <div className="text-center max-w-md p-6">
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="mb-4 text-gray-600">Please log in to view this organization.</p>
          </div>
        </div>
        <LoginDialog 
          isOpen={loginDialogOpen} 
          setIsOpen={(open) => {
            setLoginDialogOpen(open);
            if (!open) {
              // If the dialog is closed, check auth again
              window.location.reload();
            }
          }} 
        />
      </>
    );
  }
  
  if (error || !organization) {
    return <OrganizationError 
      error={error} 
      onRetry={handleRetry} 
      availableOrgs={availableOrgs}
    />;
  }
  
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-white w-full">
        <DashboardSidebar isSuperAdmin={true} />
        
        <SidebarInset className="flex-1 overflow-auto">
          <div className="flex items-center gap-3 p-4 border-b">
            <SidebarTrigger className="lg:hidden" />
            <div className="flex-1">
              <OrganizationHeader 
                organization={organization}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleWebsiteToggle={handleWebsiteToggle}
                showComingSoonToast={showComingSoonToast}
              />
            </div>
          </div>
          
          <main className="p-6">
            <OrganizationTabContent
              activeTab={activeTab}
              organization={organization}
              handleWebsiteToggle={handleWebsiteToggle}
              showComingSoonToast={showComingSoonToast}
            />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default OrganizationDashboard;
