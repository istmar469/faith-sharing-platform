
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, Settings, FileText, Globe, Users, CreditCard, 
  BarChart3, Video, MessageSquare, Layers, ChevronDown, ArrowLeft, ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useMediaQuery } from '@/hooks/use-media-query';

interface SideNavProps {
  isSuperAdmin?: boolean;
}

const SideNav: React.FC<SideNavProps> = ({ isSuperAdmin = false }) => {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Auto-collapse on mobile by default
  useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  return (
    <div className={cn(
      "h-screen bg-primary text-white flex flex-col relative transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Collapse toggle button */}
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute -right-3 top-16 z-50 h-6 w-6 rounded-full border border-primary-light bg-primary text-white p-0",
          "flex items-center justify-center"
        )}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        <span className="sr-only">Toggle Sidebar</span>
      </Button>

      <div className={cn(
        "p-4 border-b border-primary-light flex justify-between items-center",
        collapsed && "justify-center p-2"
      )}>
        <h1 className={cn(
          "text-xl font-bold flex items-center gap-2",
          collapsed && "justify-center"
        )}>
          <span className="text-accent">
            {collapsed ? "C" : "Church"}
          </span>
          {!collapsed && <span>OS</span>}
        </h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-3 py-2">
          {!collapsed && (
            <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2 px-2">
              {isSuperAdmin ? 'Super Admin' : 'Dashboard'}
            </h2>
          )}
          
          <nav className="space-y-1">
            <Link to={isSuperAdmin ? "/super-admin" : "/dashboard"} className={cn(
              "flex items-center rounded-md bg-primary-dark", 
              collapsed ? "justify-center px-2 py-2" : "px-3 py-2 text-sm"
            )}>
              <LayoutDashboard className={cn("h-5 w-5", !collapsed && "mr-2")} />
              {!collapsed && <span>Dashboard</span>}
            </Link>
            
            {isSuperAdmin ? (
              <>
                <Link to="/tenant-management" className={cn(
                  "flex items-center rounded-md hover:bg-primary-dark", 
                  collapsed ? "justify-center px-2 py-2" : "px-3 py-2 text-sm"
                )}>
                  <Users className={cn("h-5 w-5", !collapsed && "mr-2")} />
                  {!collapsed && <span>Tenant Management</span>}
                </Link>
                <Link to="/subscriptions" className={cn(
                  "flex items-center rounded-md hover:bg-primary-dark", 
                  collapsed ? "justify-center px-2 py-2" : "px-3 py-2 text-sm"
                )}>
                  <CreditCard className={cn("h-5 w-5", !collapsed && "mr-2")} />
                  {!collapsed && <span>Subscriptions</span>}
                </Link>
                <Link to="/modules-control" className={cn(
                  "flex items-center rounded-md hover:bg-primary-dark", 
                  collapsed ? "justify-center px-2 py-2" : "px-3 py-2 text-sm"
                )}>
                  <Layers className={cn("h-5 w-5", !collapsed && "mr-2")} />
                  {!collapsed && <span>Modules Control</span>}
                </Link>
                <Link to="/reports" className={cn(
                  "flex items-center rounded-md hover:bg-primary-dark", 
                  collapsed ? "justify-center px-2 py-2" : "px-3 py-2 text-sm"
                )}>
                  <BarChart3 className={cn("h-5 w-5", !collapsed && "mr-2")} />
                  {!collapsed && <span>Reports</span>}
                </Link>
              </>
            ) : (
              <>
                {!collapsed ? (
                  <Collapsible className="w-full">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-md hover:bg-primary-dark">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          Page Builder
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-9 space-y-1">
                      <Link to="/page-builder" className="block py-2 text-sm hover:text-accent">
                        Create Pages
                      </Link>
                      <Link to="/templates" className="block py-2 text-sm hover:text-accent">
                        Templates
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <Link to="/page-builder" className="flex justify-center px-2 py-2 rounded-md hover:bg-primary-dark">
                    <FileText className="h-5 w-5" />
                  </Link>
                )}
                
                {!collapsed ? (
                  <Collapsible className="w-full">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-md hover:bg-primary-dark">
                        <div className="flex items-center">
                          <Settings className="h-5 w-5 mr-2" />
                          Settings
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-9 space-y-1">
                      <Link to="/settings/custom-domain" className="block py-2 text-sm hover:text-accent">
                        Custom Domain
                      </Link>
                      <Link to="/settings/tenant" className="block py-2 text-sm hover:text-accent">
                        Tenant Management
                      </Link>
                      <Link to="/settings/sermon" className="block py-2 text-sm hover:text-accent">
                        Sermon Settings
                      </Link>
                      <Link to="/settings/donations" className="block py-2 text-sm hover:text-accent">
                        Donation Forms
                      </Link>
                      <Link to="/settings/streaming" className="block py-2 text-sm hover:text-accent">
                        Live Streaming
                      </Link>
                      <Link to="/settings/socials" className="block py-2 text-sm hover:text-accent">
                        Social Media
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <Link to="/settings/custom-domain" className="flex justify-center px-2 py-2 rounded-md hover:bg-primary-dark">
                    <Settings className="h-5 w-5" />
                  </Link>
                )}
                
                <Link to="/livestream" className={cn(
                  "flex items-center rounded-md hover:bg-primary-dark", 
                  collapsed ? "justify-center px-2 py-2" : "px-3 py-2 text-sm"
                )}>
                  <Video className={cn("h-5 w-5", !collapsed && "mr-2")} />
                  {!collapsed && <span>Live Streaming</span>}
                </Link>
                
                <Link to="/communication" className={cn(
                  "flex items-center rounded-md hover:bg-primary-dark", 
                  collapsed ? "justify-center px-2 py-2" : "px-3 py-2 text-sm"
                )}>
                  <MessageSquare className={cn("h-5 w-5", !collapsed && "mr-2")} />
                  {!collapsed && <span>Communication</span>}
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
      
      <div className={cn(
        "border-t border-primary-light",
        collapsed ? "p-2" : "p-4"
      )}>
        <div className={cn(
          "flex items-center", 
          collapsed && "justify-center"
        )}>
          <div className="h-8 w-8 rounded-full bg-accent text-primary font-bold flex items-center justify-center">
            {isSuperAdmin ? 'A' : 'C'}
          </div>
          {!collapsed && (
            <div className="ml-2">
              <p className="text-sm font-medium truncate">
                {isSuperAdmin ? 'Admin User' : 'Church Account'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {isSuperAdmin ? 'admin@church-os.com' : 'user@example.com'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SideNav;
