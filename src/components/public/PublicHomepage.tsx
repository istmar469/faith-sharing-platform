
import React, { useState, useEffect } from 'react';
import { useTenantContext } from '@/components/context/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import DynamicPageRenderer from './DynamicPageRenderer';
import AdminBar from '@/components/admin/AdminBar';

const PublicHomepage: React.FC = () => {
  const { organizationId, isSubdomainAccess } = useTenantContext();
  const [user, setUser] = useState<any>(null);
  const [homepageData, setHomepageData] = useState<any>(null);
  const [showAdminBar, setShowAdminBar] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Show admin bar if user is authenticated
      if (user) {
        setShowAdminBar(true);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setShowAdminBar(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Load homepage data for admin bar
    const loadHomepage = async () => {
      if (!organizationId) return;

      try {
        const { data } = await supabase
          .from('pages')
          .select('id')
          .eq('organization_id', organizationId)
          .eq('is_homepage', true)
          .single();

        setHomepageData(data);
      } catch (error) {
        console.error('Error loading homepage:', error);
      }
    };

    loadHomepage();
  }, [organizationId]);

  return (
    <div className="min-h-screen w-full">
      {/* Admin Bar for authenticated users */}
      {showAdminBar && user && (
        <AdminBar
          isSubdomainAccess={isSubdomainAccess}
          homepageData={homepageData}
          onDismiss={() => setShowAdminBar(false)}
        />
      )}

      {/* Dynamic Page Content */}
      <div className={showAdminBar && user ? 'pt-12' : ''}>
        <DynamicPageRenderer />
      </div>
    </div>
  );
};

export default PublicHomepage;
