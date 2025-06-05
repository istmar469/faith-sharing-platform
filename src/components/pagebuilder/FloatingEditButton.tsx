
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Edit, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/components/context/TenantContext';

interface FloatingEditButtonProps {
  pageSlug?: string;
}

const FloatingEditButton: React.FC<FloatingEditButtonProps> = ({ pageSlug }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { organizationId, isSubdomainAccess } = useTenantContext();
  const [user, setUser] = useState<any>(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    checkUserPermissions();
  }, [organizationId]);

  const checkUserPermissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user || !organizationId) {
        setCanEdit(false);
        return;
      }

      // Check if user is member of this organization
      const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', user.id)
        .single();

      setCanEdit(!!membership);
    } catch (error) {
      console.error('Error checking permissions:', error);
      setCanEdit(false);
    }
  };

  const handleEdit = () => {
    const slug = pageSlug || extractSlugFromPath();
    navigate(`/${slug}/edit`);
  };

  const handleDashboard = () => {
    if (isSubdomainAccess) {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/${organizationId}`);
    }
  };

  const handleNewPage = () => {
    const newSlug = prompt('Enter page URL (slug):');
    if (newSlug) {
      const cleanSlug = newSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
      navigate(`/${cleanSlug}/edit`);
    }
  };

  const extractSlugFromPath = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    return path.substring(1); // Remove leading slash
  };

  // Don't show if user can't edit or we're already in edit mode
  if (!canEdit || location.pathname.includes('/edit') || location.pathname.includes('/dashboard')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {/* Edit Current Page Button */}
      <Button
        onClick={handleEdit}
        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full p-3"
        size="sm"
      >
        <Edit className="h-5 w-5" />
      </Button>

      {/* New Page Button */}
      <Button
        onClick={handleNewPage}
        className="bg-green-600 hover:bg-green-700 text-white shadow-lg rounded-full p-3"
        size="sm"
      >
        <Plus className="h-5 w-5" />
      </Button>

      {/* Dashboard Button */}
      <Button
        onClick={handleDashboard}
        variant="outline"
        className="bg-white hover:bg-gray-50 shadow-lg rounded-full p-3"
        size="sm"
      >
        <Settings className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default FloatingEditButton;
