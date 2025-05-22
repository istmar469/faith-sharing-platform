
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { FileText, Video, Calendar, CreditCard } from 'lucide-react';

interface QuickActionsProps {
  showComingSoonToast: () => void;
  organizationId?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ showComingSoonToast, organizationId }) => {
  const navigate = useNavigate();
  
  const handleCreatePage = () => {
    if (organizationId) {
      navigate(`/tenant-dashboard/${organizationId}/page-builder`);
    } else {
      showComingSoonToast();
    }
  };

  const handleScheduleStream = () => {
    if (organizationId) {
      navigate(`/tenant-dashboard/${organizationId}/livestream`);
    } else {
      showComingSoonToast();
    }
  };

  const handleAddEvent = () => {
    if (organizationId) {
      navigate(`/tenant-dashboard/${organizationId}/calendar`);
    } else {
      showComingSoonToast();
    }
  };

  const handleDonationForm = () => {
    if (organizationId) {
      navigate(`/tenant-dashboard/${organizationId}/settings/donations`);
    } else {
      showComingSoonToast();
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button 
          variant="outline"
          className="flex flex-col items-center justify-center h-24 p-2 bg-white hover:bg-gray-50"
          onClick={handleCreatePage}
        >
          <FileText className="h-8 w-8 mb-2 text-primary" />
          <span>Create Page</span>
        </Button>
        
        <Button 
          variant="outline"
          className="flex flex-col items-center justify-center h-24 p-2 bg-white hover:bg-gray-50"
          onClick={handleScheduleStream}
        >
          <Video className="h-8 w-8 mb-2 text-primary" />
          <span>Schedule Stream</span>
        </Button>
        
        <Button 
          variant="outline"
          className="flex flex-col items-center justify-center h-24 p-2 bg-white hover:bg-gray-50"
          onClick={handleAddEvent}
        >
          <Calendar className="h-8 w-8 mb-2 text-primary" />
          <span>Add Event</span>
        </Button>
        
        <Button 
          variant="outline"
          className="flex flex-col items-center justify-center h-24 p-2 bg-white hover:bg-gray-50"
          onClick={handleDonationForm}
        >
          <CreditCard className="h-8 w-8 mb-2 text-primary" />
          <span>Donation Form</span>
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;
