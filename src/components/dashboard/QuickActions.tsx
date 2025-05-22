
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Video, Calendar, CreditCard } from 'lucide-react';

interface QuickActionsProps {
  showComingSoonToast: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ showComingSoonToast }) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button 
          variant="outline"
          className="flex flex-col items-center justify-center h-24 p-2 bg-white hover:bg-gray-50"
          onClick={showComingSoonToast}
        >
          <FileText className="h-8 w-8 mb-2 text-primary" />
          <span>Create Page</span>
        </Button>
        
        <Button 
          variant="outline"
          className="flex flex-col items-center justify-center h-24 p-2 bg-white hover:bg-gray-50"
          onClick={showComingSoonToast}
        >
          <Video className="h-8 w-8 mb-2 text-primary" />
          <span>Schedule Stream</span>
        </Button>
        
        <Button 
          variant="outline"
          className="flex flex-col items-center justify-center h-24 p-2 bg-white hover:bg-gray-50"
          onClick={showComingSoonToast}
        >
          <Calendar className="h-8 w-8 mb-2 text-primary" />
          <span>Add Event</span>
        </Button>
        
        <Button 
          variant="outline"
          className="flex flex-col items-center justify-center h-24 p-2 bg-white hover:bg-gray-50"
          onClick={showComingSoonToast}
        >
          <CreditCard className="h-8 w-8 mb-2 text-primary" />
          <span>Donation Form</span>
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;
