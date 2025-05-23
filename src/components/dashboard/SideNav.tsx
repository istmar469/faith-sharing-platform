import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Settings, FileText, Globe, Users, CreditCard, 
  BarChart3, Video, MessageSquare, Layers, ChevronDown, ChevronRight, ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTenantContext } from '@/components/context/TenantContext';
import { useViewMode } from '@/components/context/ViewModeContext';

interface SideNavProps {
  isSuperAdmin?: boolean;
  organizationId?: string;
}

const SideNav: React.FC<SideNavProps> = ({ isSuperAdmin = false, organizationId }) => {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const location = useLocation();
  const { organizationId: contextOrgId, isSubdomainAccess } = useTenantContext();
  const { viewMode } = useViewMode();
  
  // Use the passed organizationId or the one from context
  const effectiveOrgId = organizationId || contextOrgId;
  const inSuperAdminMode = isSuperAdmin && viewMode === 'super_admin' && !isSubdomainAccess;
  
  // Auto-collapse on mobile by default
  useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  const isActive = (path: string) => {
    if (path === "/diagnostic" && location.pathname === "/diagnostic") {
      return true;
    }
    // Check if the current path is the given path or starts with it (for nested paths)
    return location.pathname === path || 
      (path !== "/" && location.pathname.startsWith(path));
  };

  // Generate organization-aware URL for a given path
  const getOrgAwarePath = (path: string) => {
    // If we're in super admin mode, keep standard routing
    if (inSuperAdminMode) {
      return path;
    }
    
    // If we have an organization ID (either from props or context)
    if (effectiveOrgId) {
      // For tenant dashboard route
      if (path === '/tenant-dashboard') {
        return `/tenant-dashboard/${effectiveOrgId}`;
      }
      
      // For paths that should be organization-specific
      if (
        path.startsWith('/page-builder') || 
        path.startsWith('/settings/') || 
        path.startsWith('/livestream') || 
        path.startsWith('/communication')
      ) {
        // Convert to organization-specific path by prefixing with tenant dashboard path
        return `/tenant-dashboard/${effectiveOrgId}${path}`;
      }
    }
    
    // Default case - return original path
    return path;
  };

  const renderNavLink = (to: string, icon: React.ReactNode, label: string) => {
    const orgAwarePath = getOrgAwarePath(to);
    const active = isActive(orgAwarePath);
    
    return collapsed ? (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to={orgAwarePath} className={cn(
              "flex justify-center px-2 py-2 rounded-md", 
              active ? "bg-primary-dark" : "hover:bg-primary-dark"
            )}>
              {icon}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      <Link to={orgAwarePath} className={cn(
        "flex items-center rounded-md px-3 py-2 text-sm",
        active ? "bg-primary-dark" : "hover:bg-primary-dark"
      )}>
        {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 mr-2" })}
        <span>{label}</span>
      </Link>
    );
  };

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
        "p-4 border-b border-primary-light flex items-center",
        collapsed && "justify-center p-2"
      )}>
        {collapsed ? (
          <h1 className="text-2xl font-bold text-accent">C</h1>
        ) : (
          <h1 className="text-xl font-bold flex items-center gap-1">
            <span className="text-accent">Church</span>
            <span>OS</span>
          </h1>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-3 py-2">
          {!collapsed && (
            <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2 px-2">
              {inSuperAdminMode ? 'Super Admin' : 'Dashboard'}
            </h2>
          )}
          
          <nav className="space-y-1">
            {inSuperAdminMode ? (
              // Super admin navigation items
              <>
                {renderNavLink("/dashboard", <LayoutDashboard className="h-5 w-5" />, "Dashboard")}
                {renderNavLink("/settings/org-management", <Users className="h-5 w-5" />, "Tenant Management")}
                {renderNavLink("/settings/subscription-test", <CreditCard className="h-5 w-5" />, "Subscriptions")}
                {renderNavLink("/settings/admin-management", <Layers className="h-5 w-5" />, "Admin Management")}
                {renderNavLink("/diagnostic", <BarChart3 className="h-5 w-5" />, "Diagnostics")}
              </>
            ) : (
              // Regular tenant admin navigation items
              <>
                {renderNavLink("/tenant-dashboard", <LayoutDashboard className="h-5 w-5" />, "Dashboard")}
                
                {/* Page Builder section */}
                {collapsed ? (
                  renderNavLink("/page-builder", <FileText className="h-5 w-5" />, "Page Builder")
                ) : (
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
                      <Link to={getOrgAwarePath("/page-builder")} className="block py-2 text-sm hover:text-accent">
                        Create Pages
                      </Link>
                      <Link to={getOrgAwarePath("/templates")} className="block py-2 text-sm hover:text-accent">
                        Templates
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>
                )}
                
                {/* Settings section */}
                {collapsed ? (
                  renderNavLink("/settings/domains", <Settings className="h-5 w-5" />, "Settings")
                ) : (
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
                      <Link to={getOrgAwarePath("/settings/domains")} className="block py-2 text-sm hover:text-accent">
                        Custom Domain
                      </Link>
                      <Link to={getOrgAwarePath("/settings/tenant")} className="block py-2 text-sm hover:text-accent">
                        Tenant Management
                      </Link>
                      <Link to={getOrgAwarePath("/settings/sermon")} className="block py-2 text-sm hover:text-accent">
                        Sermon Settings
                      </Link>
                      <Link to={getOrgAwarePath("/settings/donations")} className="block py-2 text-sm hover:text-accent">
                        Donation Forms
                      </Link>
                      <Link to={getOrgAwarePath("/settings/streaming")} className="block py-2 text-sm hover:text-accent">
                        Live Streaming
                      </Link>
                      <Link to={getOrgAwarePath("/settings/socials")} className="block py-2 text-sm hover:text-accent">
                        Social Media
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>
                )}
                
                {/* Live streaming & Communication (avoid duplicates) */}
                {renderNavLink("/livestream", <Video className="h-5 w-5" />, "Live Streaming")}
                {renderNavLink("/communication", <MessageSquare className="h-5 w-5" />, "Communication")}
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
