
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, MessageSquare, Clock, Phone, BarChart3, Settings } from 'lucide-react';
import EventsManagement from '@/components/events/EventsManagement';
import StaffDirectoryManager from './StaffDirectoryManager';
import AnnouncementsManager from './AnnouncementsManager';
import EnhancedChurchComponentsManager from './EnhancedChurchComponentsManager';

const ChurchManagementTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const managementCards = [
    {
      id: 'events',
      title: 'Events',
      description: 'Manage church events and calendar',
      icon: Calendar,
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      id: 'staff',
      title: 'Staff Directory',
      description: 'Manage church staff and leadership',
      icon: Users,
      color: 'bg-green-50 text-green-600 border-green-200'
    },
    {
      id: 'announcements',
      title: 'Announcements',
      description: 'Create and manage church announcements',
      icon: MessageSquare,
      color: 'bg-orange-50 text-orange-600 border-orange-200'
    },
    {
      id: 'components',
      title: 'Website Components',
      description: 'Configure website display components',
      icon: Settings,
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Church Management</h2>
        <p className="text-gray-600">
          Manage your church's content and website components from this central dashboard
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {managementCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <Card 
                  key={card.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${card.color}`}
                  onClick={() => setActiveTab(card.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/50">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{card.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {card.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm opacity-75">
                      Click to manage {card.title.toLowerCase()}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Overview</CardTitle>
              <CardDescription>
                Your church management dashboard provides centralized control over all content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h4 className="font-semibold">Event Management</h4>
                  <p className="text-sm text-gray-600">Create and schedule church events</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h4 className="font-semibold">Staff Directory</h4>
                  <p className="text-sm text-gray-600">Manage staff profiles and info</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <h4 className="font-semibold">Announcements</h4>
                  <p className="text-sm text-gray-600">Share important church news</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <EventsManagement />
        </TabsContent>

        <TabsContent value="staff">
          <StaffDirectoryManager />
        </TabsContent>

        <TabsContent value="announcements">
          <AnnouncementsManager />
        </TabsContent>

        <TabsContent value="components">
          <EnhancedChurchComponentsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChurchManagementTab;
