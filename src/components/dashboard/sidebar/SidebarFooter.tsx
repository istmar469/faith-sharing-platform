
import React from 'react';
import { SidebarFooter } from '@/components/ui/sidebar';

const DashboardSidebarFooter: React.FC = () => {
  return (
    <SidebarFooter className="p-4 border-t">
      <div className="space-y-2">
        <a 
          href="https://churchos.freshdesk.com/support/home" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Support
        </a>
        <a 
          href="https://status.churchos.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Status
        </a>
      </div>
    </SidebarFooter>
  );
};

export default DashboardSidebarFooter;
