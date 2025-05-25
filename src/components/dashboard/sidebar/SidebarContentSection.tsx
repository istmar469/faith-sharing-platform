
import React from 'react';
import { Calendar, Mail, FileText, Image, Users, Settings, BarChart3, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarContentSectionProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  organizationId?: string;
}

const SidebarContentSection: React.FC<SidebarContentSectionProps> = ({
  activeTab,
  onTabChange,
  organizationId,
}) => {
  const contentItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'contact-forms', label: 'Contact Forms', icon: MessageSquare },
    { id: 'members', label: 'Members', icon: Users },
  ];

  return (
    <div className="space-y-1">
      <div className="px-3 py-2">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Content
        </h2>
      </div>
      {contentItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              'w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === item.id
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            <Icon className="mr-3 h-4 w-4" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export default SidebarContentSection;
