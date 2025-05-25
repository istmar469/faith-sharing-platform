
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CreditCard, Users } from 'lucide-react';
import { useTenantContext } from '@/components/context/TenantContext';

interface ActivitySubscriptionProps {
  showComingSoonToast: () => void;
  organizationId?: string;
}

const ActivitySubscription: React.FC<ActivitySubscriptionProps> = ({ 
  showComingSoonToast, 
  organizationId 
}) => {
  const navigate = useNavigate();
  const { organizationId: contextOrgId } = useTenantContext();
  
  // Use the passed organizationId or the one from context
  const effectiveOrgId = organizationId || contextOrgId;
  
  const handleViewAllActivity = () => {
    if (effectiveOrgId) {
      navigate(`/dashboard/${effectiveOrgId}?tab=activity`);
    } else {
      showComingSoonToast();
    }
  };
  
  const handleManageSubscription = () => {
    if (effectiveOrgId) {
      navigate(`/dashboard/${effectiveOrgId}?tab=settings&section=subscription`);
    } else {
      showComingSoonToast();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your site's recent activities and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center text-white mr-3">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Home page updated</p>
                  <p className="text-xs text-gray-500">Yesterday at 4:30 PM</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center text-white mr-3">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Donation received: $50.00</p>
                  <p className="text-xs text-gray-500">2 days ago at 10:15 AM</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center text-white mr-3">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">New subscriber: john.doe@example.com</p>
                  <p className="text-xs text-gray-500">3 days ago at 3:45 PM</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={handleViewAllActivity}>
              View All Activity
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Your Subscription</CardTitle>
            <CardDescription>Current plan and usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-primary/10 rounded-md border border-primary/20">
              <h3 className="font-medium text-primary">Standard Plan</h3>
              <p className="text-sm text-gray-500">Renews on Jun 1, 2025</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Storage</span>
                <span className="font-medium">45% used</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '45%' }}></div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Bandwidth</span>
                <span className="font-medium">32% used</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '32%' }}></div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={handleManageSubscription}>
              Manage Subscription
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ActivitySubscription;
