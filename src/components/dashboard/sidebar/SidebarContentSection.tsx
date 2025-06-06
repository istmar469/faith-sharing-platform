import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Mail, FileText, Image, Users, Settings, BarChart3, MessageSquare, Globe, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTenantContext } from '@/components/context/TenantContext';

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
  const navigate = useNavigate();
  const location = useLocation();
  const { isSubdomainAccess } = useTenantContext();

  // Check if we're on the page builder route
  const isOnPageBuilder = location.pathname.includes('/page-builder');

  const handleItemClick = (itemId: string) => {
    if (isOnPageBuilder) {
      // If we're on page builder, navigate to dashboard routes
      if (itemId === 'website') {
        // Stay on page builder for website/site editor
        return;
      } else {
        // Navigate to dashboard for other items
        if (isSubdomainAccess) {
          navigate(`/?tab=${itemId}`);
        } else if (organizationId) {
          navigate(`/dashboard/${organizationId}?tab=${itemId}`);
        } else {
          navigate(`/dashboard?tab=${itemId}`);
        }
      }
    } else {
      // If we're on dashboard, use tab switching
      onTabChange(itemId);
    }
  };

  const contentItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { 
      id: 'pages', 
      label: 'Pages', 
      icon: Edit,
    },
    { id: 'site-settings', label: 'Site Settings', icon: Settings },
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
        const isActive = item.id === 'pages' 
          ? isOnPageBuilder || activeTab === 'pages' 
          : activeTab === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className={cn(
              'w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive
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
