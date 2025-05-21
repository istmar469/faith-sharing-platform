
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, Settings, FileText, Globe, Users, CreditCard, 
  BarChart3, Video, MessageSquare, Layers, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SideNavProps {
  isSuperAdmin?: boolean;
}

const SideNav: React.FC<SideNavProps> = ({ isSuperAdmin = false }) => {
  return (
    <div className="h-screen w-64 bg-primary text-white flex flex-col">
      <div className="p-4 border-b border-primary-light">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-accent">Church</span>OS
        </h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-3 py-2">
          <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">
            {isSuperAdmin ? 'Super Admin' : 'Dashboard'}
          </h2>
          
          <nav className="space-y-1">
            <Link to={isSuperAdmin ? "/super-admin" : "/dashboard"} className="flex items-center px-3 py-2 text-sm rounded-md bg-primary-dark">
              <LayoutDashboard className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
            
            {isSuperAdmin ? (
              <>
                <Link to="/tenant-management" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-primary-dark">
                  <Users className="h-5 w-5 mr-2" />
                  Tenant Management
                </Link>
                <Link to="/subscriptions" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-primary-dark">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Subscriptions
                </Link>
                <Link to="/modules-control" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-primary-dark">
                  <Layers className="h-5 w-5 mr-2" />
                  Modules Control
                </Link>
                <Link to="/reports" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-primary-dark">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Reports
                </Link>
              </>
            ) : (
              <>
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
                
                <Link to="/livestream" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-primary-dark">
                  <Video className="h-5 w-5 mr-2" />
                  Live Streaming
                </Link>
                
                <Link to="/communication" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-primary-dark">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Communication
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
      
      <div className="p-4 border-t border-primary-light">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-accent text-primary font-bold flex items-center justify-center">
            {isSuperAdmin ? 'A' : 'C'}
          </div>
          <div className="ml-2">
            <p className="text-sm font-medium truncate">
              {isSuperAdmin ? 'Admin User' : 'Church Account'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {isSuperAdmin ? 'admin@church-os.com' : 'user@example.com'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideNav;
