
import React from 'react';
import { Shield, User } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { useViewMode } from "@/components/context/ViewModeContext";
import { useToast } from "@/hooks/use-toast";
import { useTenantContext } from '@/components/context/TenantContext';
import { useNavigate } from 'react-router-dom';

interface ViewModeToggleProps {
  className?: string;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ className }) => {
  const { viewMode, toggleViewMode } = useViewMode();
  const { toast } = useToast();
  const { organizationId } = useTenantContext();
  const navigate = useNavigate();
  
  const handleToggle = () => {
    const newMode = viewMode === 'super_admin' ? 'regular_admin' : 'super_admin';
    toggleViewMode();
    
    // Based on the new mode, redirect to the appropriate view
    if (newMode === 'super_admin') {
      // Switching to super admin mode - go to main dashboard
      navigate('/dashboard');
    } else if (newMode === 'regular_admin' && organizationId) {
      // Switching to regular admin mode - go to tenant dashboard with org ID
      navigate(`/tenant-dashboard/${organizationId}`);
    }
    
    toast({
      title: viewMode === 'super_admin' ? "Viewing as Regular Admin" : "Viewing as Super Admin",
      description: viewMode === 'super_admin' 
        ? "You are now viewing this organization as a regular admin"
        : "You now have full super admin privileges",
      duration: 3000,
    });
  };
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <User className={`h-4 w-4 ${viewMode === 'regular_admin' ? 'text-primary' : 'text-muted-foreground'}`} />
      
      <Switch
        checked={viewMode === 'super_admin'}
        onCheckedChange={handleToggle}
      />
      
      <Shield className={`h-4 w-4 ${viewMode === 'super_admin' ? 'text-primary' : 'text-muted-foreground'}`} />
      
      <span className="text-sm font-medium">
        {viewMode === 'super_admin' ? 'Super Admin View' : 'Admin View'}
      </span>
    </div>
  );
};

export default ViewModeToggle;
