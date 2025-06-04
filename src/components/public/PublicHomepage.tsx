
import React, { useState, useEffect } from 'react';
import { useTenantContext } from '@/components/context/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import SubdomainPage from '@/components/subdomain/SubdomainPage';
import AdminBar from '@/components/admin/AdminBar';

const PublicHomepage: React.FC = () => {
  const { organizationId, isSubdomainAccess } = useTenantContext();
  const [user, setUser] = useState<any>(null);
  const [homepageData, setHomepageData] = useState<any>(null);
  const [availablePages, setAvailablePages] = useState<any[]>([]);
  const [showAdminBar, setShowAdminBar] = useState(false);
  const [loading, setLoading] = useState(true);

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
    // Load homepage and available pages
    const loadPageData = async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }

      try {
        // Load homepage
        const { data: homepage } = await supabase
          .from('pages')
          .select('id, title, content')
          .eq('organization_id', organizationId)
          .eq('is_homepage', true)
          .eq('published', true)
          .single();

        setHomepageData(homepage);

        // Load all available pages
        const { data: pages } = await supabase
          .from('pages')
          .select('id, title, slug, is_homepage, published')
          .eq('organization_id', organizationId)
          .eq('published', true)
          .order('title');

        setAvailablePages(pages || []);
      } catch (error) {
        console.error('Error loading page data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, [organizationId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

      {/* Main Content */}
      <div className={showAdminBar && user ? 'pt-12' : ''}>
        <SubdomainPage 
          homepageData={homepageData}
          availablePages={availablePages}
          adminBarOffset={showAdminBar && !!user}
        />
      </div>
    </div>
  );
};

export default PublicHomepage;
