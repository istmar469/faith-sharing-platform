
import { Plugin, PluginConfig, PluginComponent, PluginContext } from '@/types/plugins';
import ServiceTimesTab from './components/ServiceTimesTab';
import EventCalendarTab from './components/EventCalendarTab';
import StaffDirectoryTab from './components/StaffDirectoryTab';
import ContactInfoTab from './components/ContactInfoTab';
import AnnouncementBoardTab from './components/AnnouncementBoardTab';
import ChurchStatsTab from './components/ChurchStatsTab';

export class ChurchManagementPlugin implements Plugin {
  config: PluginConfig = {
    id: 'church-management',
    name: 'Church Management Components',
    version: '1.0.0',
    description: 'Puck components for church management features like service times, events, staff directory, and more',
    author: 'ChurchOS Team',
    dependencies: [],
    permissions: [
      { type: 'database', scope: 'church_info', actions: ['read'] },
      { type: 'database', scope: 'events', actions: ['read'] },
      { type: 'database', scope: 'component_permissions', actions: ['read', 'write'] },
      { type: 'database', scope: 'enabled_components', actions: ['read', 'write'] }
    ]
  };

  components: PluginComponent[] = [
    {
      id: 'service-times-tab',
      type: 'sidebar',
      component: ServiceTimesTab,
      position: 'right'
    },
    {
      id: 'event-calendar-tab', 
      type: 'sidebar',
      component: EventCalendarTab,
      position: 'right'
    },
    {
      id: 'staff-directory-tab',
      type: 'sidebar', 
      component: StaffDirectoryTab,
      position: 'right'
    },
    {
      id: 'contact-info-tab',
      type: 'sidebar',
      component: ContactInfoTab, 
      position: 'right'
    },
    {
      id: 'announcement-board-tab',
      type: 'sidebar',
      component: AnnouncementBoardTab,
      position: 'right'
    },
    {
      id: 'church-stats-tab',
      type: 'sidebar',
      component: ChurchStatsTab,
      position: 'right'
    }
  ];

  async onLoad(context: PluginContext): Promise<void> {
    console.log('Church Management Plugin loading...');
  }

  async onInitialize(context: PluginContext): Promise<void> {
    console.log('Church Management Plugin initialized');
  }

  async onActivate(context: PluginContext): Promise<void> {
    console.log('Church Management Plugin activated');
    
    // Register church management components with Puck
    context.eventBus.emit('register-church-components', {
      organizationId: context.organizationId
    });
  }

  async onDeactivate(context: PluginContext): Promise<void> {
    console.log('Church Management Plugin deactivated');
  }
}
