
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, DollarSign, Settings, Plus } from 'lucide-react';
import ChurchManagementTab from '../ChurchManagementTab';
import ContactFormTab from '../ContactFormTab';
import DashboardMetrics from './DashboardMetrics';
import QuickActionsCard from './QuickActionsCard';
import RecentActivityCard from './RecentActivityCard';
import { DashboardStats, Organization } from '../hooks/useDashboardData';

interface DashboardTabContentProps {
  activeTab: string;
  stats: DashboardStats;
  organization: Organization;
  onCreateEvent: () => void;
  onViewMembers: () => void;
  onViewDonations: () => void;
  onTabChange: (tab: string) => void;
}

const DashboardTabContent: React.FC<DashboardTabContentProps> = ({
  activeTab,
  stats,
  organization,
  onCreateEvent,
  onViewMembers,
  onViewDonations,
  onTabChange
}) => {
  return (
    <>
      <TabsContent value="overview" className="space-y-6">
        <DashboardMetrics stats={stats} />
        <QuickActionsCard 
          onCreateEvent={onCreateEvent}
          onViewMembers={onViewMembers}
          onViewDonations={onViewDonations}
        />
        <RecentActivityCard />
      </TabsContent>

      <TabsContent value="church">
        <ChurchManagementTab />
      </TabsContent>
      
      <TabsContent value="members">
        <Card>
          <CardHeader>
            <CardTitle>Member Management</CardTitle>
            <CardDescription>Manage your church members and their information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Member Management Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                Add, edit, and manage your church members with roles and contact information.
              </p>
              <Button onClick={onViewMembers}>
                <Plus className="mr-2 h-4 w-4" />
                Get Started
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="events">
        <Card>
          <CardHeader>
            <CardTitle>Event Management</CardTitle>
            <CardDescription>Plan and manage church events and services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Event Management</h3>
              <p className="text-muted-foreground mb-4">
                Create and manage church events, services, and special occasions.
              </p>
              <Button onClick={() => onTabChange('church')}>
                <Plus className="mr-2 h-4 w-4" />
                Manage Events
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="contact-forms">
        <ContactFormTab />
      </TabsContent>
      
      <TabsContent value="finances">
        <Card>
          <CardHeader>
            <CardTitle>Financial Management</CardTitle>
            <CardDescription>Track donations and manage church finances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Financial Tracking</h3>
              <p className="text-muted-foreground mb-4">
                Record donations, track funds, and generate financial reports.
              </p>
              <Button onClick={onViewDonations}>
                <Plus className="mr-2 h-4 w-4" />
                Record Donation
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="settings" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Church Settings</CardTitle>
            <CardDescription>Configure your church information and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Organization Details</h4>
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Church Name</label>
                    <p className="font-medium">{organization.name}</p>
                  </div>
                  {organization.subdomain && (
                    <div>
                      <label className="text-sm text-muted-foreground">Subdomain</label>
                      <p className="font-medium">{organization.subdomain}.church-os.com</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-muted-foreground">Website Status</label>
                    <p className="font-medium">
                      {organization.website_enabled ? 'Active' : 'Disabled'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Advanced Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};

export default DashboardTabContent;
