
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const RecentActivityCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates and actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Dashboard accessed</p>
              <p className="text-xs text-muted-foreground">Just now</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Organization data loaded</p>
              <p className="text-xs text-muted-foreground">1 minute ago</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivityCard;
