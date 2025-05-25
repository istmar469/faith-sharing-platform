
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Church, Users, DollarSign, Settings } from 'lucide-react';

interface QuickActionsCardProps {
  onCreateEvent: () => void;
  onViewMembers: () => void;
  onViewDonations: () => void;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  onCreateEvent,
  onViewMembers,
  onViewDonations
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Button onClick={onCreateEvent} className="h-auto p-4 flex flex-col gap-2">
            <Church className="h-6 w-6" />
            <span>Manage Church</span>
          </Button>
          
          <Button onClick={onViewMembers} variant="outline" className="h-auto p-4 flex flex-col gap-2">
            <Users className="h-6 w-6" />
            <span>Manage Members</span>
          </Button>
          
          <Button onClick={onViewDonations} variant="outline" className="h-auto p-4 flex flex-col gap-2">
            <DollarSign className="h-6 w-6" />
            <span>Record Donation</span>
          </Button>
          
          <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
            <Settings className="h-6 w-6" />
            <span>Church Settings</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
