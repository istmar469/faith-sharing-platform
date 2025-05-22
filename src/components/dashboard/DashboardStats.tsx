
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DashboardStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Weekly Donations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$1,254.00</div>
          <p className="text-xs text-green-500 flex items-center">
            +12.5% from last week
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Website Visitors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,423</div>
          <p className="text-xs text-green-500 flex items-center">
            +5.2% from last week
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">8</div>
          <p className="text-xs text-gray-500 flex items-center">
            Next: Sunday Service (2 days)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
